import { API_BASE } from "../modules/config.js";
import { initReveal } from "../modules/animations.js";
import { initCustomSelects } from "../modules/forms.js";
import { initAutocomplete } from "../modules/autocomplete.js";
import { initDetailsOrigin } from "../modules/details-origin.js";


// Appels API
async function apiGetFavorites(token) {
  try {
    const res = await fetch(`${API_BASE}/api/favorites`, {
      headers: { "Authorization": "Bearer " + token }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.favorites || [];
  } catch (e) {
    console.error("Erreur API favorites:", e);
    return [];
  }
}

async function apiRemoveFavorite(id, token) {
  const res = await fetch(`${API_BASE}/api/characters/` + id + "/favorite", {
    method: "DELETE",
    headers: { "Authorization": "Bearer " + token }
  });

  return res.json();
}


// Lecture de la valeur d'un select personnalisé
function getSelectValue(id) {
  return document.querySelector("#" + id + " .trigger-text")?.dataset.value || "";
}


// Tranches de genres possibles
const GENRE_LABELS = {
  warrior: "Guerrier",
  archer: "Archer",
  mage: "Mage",
  paladin: "Paladin",
  wizard: "Enchanteur",
  druid: "Druide"
};

// Tranches de dates possibles
const DATE_RANGES = [
  { value: "today", label: "Aujourd'hui" },
  { value: "yesterday", label: "Hier" },
  { value: "7days", label: "7 derniers jours" },
  { value: "30days", label: "30 derniers jours" },
  { value: "year", label: "Cette année" },
  { value: "old", label: "Années précédentes" }
];


// Vérifie si une date correspond à la tranche choisie
function matchDate(createdAt, filter) {
  if (!filter) return true;

  const date = new Date(createdAt);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = 24 * 60 * 60 * 1000;

  switch (filter) {
    case "today":
      return date >= startOfToday;
    case "yesterday":
      return date >= new Date(startOfToday - day) && date < startOfToday;
    case "7days":
      return date >= new Date(startOfToday - 7 * day);
    case "30days":
      return date >= new Date(startOfToday - 30 * day);
    case "year":
      return date.getFullYear() === now.getFullYear();
    case "old":
      return date.getFullYear() < now.getFullYear();
    default:
      return true;
  }
}


// Récupère les genres présents et construit les options
function buildGenreOptions(favorites) {
  const optionsBox = document.querySelector("#genre-filter .custom-options");
  if (!optionsBox) return;

  const types = [...new Set(favorites.map(f => f.type).filter(Boolean))];

  optionsBox.innerHTML = `<span class="custom-option" data-value="">Tous</span>` +
    types.map(t => `<span class="custom-option" data-value="${t}">${GENRE_LABELS[t] || t}</span>`).join("");
}


// Récupère les dates présentes et construit les options
function buildDateOptions(favorites) {
  const optionsBox = document.querySelector("#date-filter .custom-options");
  if (!optionsBox) return;

  const available = DATE_RANGES.filter(r =>
    favorites.some(f => matchDate(f.createdAt, r.value))
  );

  optionsBox.innerHTML = `<span class="custom-option" data-value="">Tous</span>` +
    available.map(r => `<span class="custom-option" data-value="${r.value}">${r.label}</span>`).join("");
}


// Filtre les favoris selon le pseudo, le genre et la date
function filterFavorites(favorites) {
  const pseudo = document.querySelector("#pseudo-input")?.value.trim().toLowerCase() || "";
  const genre = getSelectValue("genre-filter");
  const date = getSelectValue("date-filter");

  return favorites.filter(f => {
    const matchPseudo = pseudo === "" || (f.creator || "").toLowerCase().includes(pseudo);
    const matchGenre = genre === "" || f.type === genre;
    const matchCreated = matchDate(f.createdAt, date);

    return matchPseudo && matchGenre && matchCreated;
  });
}


// Construit la carte d'un favori
function renderCard(char) {
  return `
    <article class="card-vertical" data-id="${char.id}">

      <div class="creator-tag creator-tag-vertical">
        <i class="bi bi-person-fill"></i>
        <span>${char.creator}</span>
      </div>

      <i class="bi bi-heart-fill heart active"></i>

      <div class="img-wrapper">
        <img src="${char.image}" alt="${char.name}">
      </div>

      <div class="info-box">
        <h3>${char.name.toUpperCase()}</h3>
        <a href="character-details?id=${char.id}" class="action-details">Détails</a>
      </div>

    </article>
  `;
}


// Affiche la liste des favoris
function renderFavorites(list, favorites) {
  const container = document.querySelector(".characters");
  const results = document.querySelector("#results");
  if (!container) return;

  container.innerHTML = list.map(renderCard).join("");

  if (results) {
    if (favorites.length === 0) {
      results.innerHTML = `<p class="message error-message show text-center">Vous n'avez aucun favori.</p>`;
    } else if (list.length === 0) {
      results.innerHTML = `<p class="message error-message show text-center">Aucun favori ne correspond à votre recherche.</p>`;
    } else {
      results.innerHTML = "";
    }
  }
}


// Initialise la page favoris : connexion, chargement, filtres et retrait
async function initFavoris() {
  const container = document.querySelector(".characters");
  if (!container) return;

  const token = localStorage.getItem("token");
  if (!token) {
    document.querySelector(".filters")?.style.setProperty("display", "none");
    container.innerHTML = `<p class="message error-message show text-center">Vous devez être connecté pour accéder à vos favoris.</p>`;
    return;
  }

  let favorites = await apiGetFavorites(token);

  buildGenreOptions(favorites);
  buildDateOptions(favorites);
  initCustomSelects();

  const pseudos = [...new Set(favorites.map(f => f.creator).filter(Boolean))];
  initAutocomplete(pseudos, () => renderFavorites(filterFavorites(favorites), favorites));

  const filterBtn = document.querySelector(".filters-form .btn");
  filterBtn?.addEventListener("click", () => renderFavorites(filterFavorites(favorites), favorites));

  renderFavorites(favorites, favorites);

  document.addEventListener("click", async (e) => {
    if (!e.target.classList.contains("heart")) return;

    const card = e.target.closest(".card-vertical");
    const id = Number(card.dataset.id);

    const data = await apiRemoveFavorite(id, token);
    if (!data || !data.success) return;

    favorites = favorites.filter(f => f.id !== id);
    card.remove();

    if (favorites.length === 0) {
      renderFavorites(favorites, favorites);
    }
  });
}


// Lance le js de la page Favoris quand elle est chargée
function start() {
  initReveal();
  initDetailsOrigin("favoris");
  initFavoris();
}

if (typeof window !== "undefined") start();
