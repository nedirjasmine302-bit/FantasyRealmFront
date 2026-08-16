import { API_BASE } from "../modules/config.js";
import { initReveal } from "../modules/animations.js";
import { initCustomSelects } from "../modules/forms.js";
import { initAutocomplete } from "../modules/autocomplete.js";
import { initDetailsOrigin } from "../modules/details-origin.js";


// Utilisateur connecté
function isLoggedIn() {
  return typeof localStorage !== "undefined" && !!localStorage.getItem("token");
}


// Appels API
async function apiGetCharacters() {
  try {
    const res = await fetch(`${API_BASE}/api/characters`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.characters || [];
  } catch (e) {
    console.error("Erreur API characters:", e);
    return [];
  }
}

async function apiGetFavoriteIds(token) {
  try {
    const res = await fetch(`${API_BASE}/api/favorites`, {
      headers: { "Authorization": "Bearer " + token }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.favorites || []).map(f => f.id);
  } catch (e) {
    console.error("Erreur API favorites:", e);
    return [];
  }
}

async function apiToggleFavorite(id, token, add) {
  const res = await fetch(`${API_BASE}/api/characters/` + id + "/favorite", {
    method: add ? "POST" : "DELETE",
    headers: { "Authorization": "Bearer " + token }
  });

  return res.json();
}


// Lecture de la valeur d'un select personnalisé
function getSelectValue(id) {
  return document.querySelector("#" + id + " .trigger-text")?.dataset.value || "";
}


// Vérifie si une date correspond au filtre choisi
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


// Filtre les personnages selon le pseudo, le genre et la date
function filterCharacters(characters) {
  const pseudo = document.querySelector("#pseudo-input")?.value.trim().toLowerCase() || "";
  const genre = getSelectValue("genre-filter");
  const date = getSelectValue("date-filter");

  return characters.filter(char => {
    const matchPseudo = pseudo === "" || (char.creator || "").toLowerCase().includes(pseudo);
    const matchGenre = genre === "" || char.type === genre;
    const matchCreated = matchDate(char.createdAt, date);

    return matchPseudo && matchGenre && matchCreated;
  });
}


// Construit la carte d'un personnage
function renderCard(char, favoriteIds) {
  const isFav = favoriteIds.includes(char.id);
  const heartClass = isFav ? "bi-heart-fill" : "bi-heart";
  const activeClass = isFav ? " active" : "";

  return `
    <article class="card-vertical" data-id="${char.id}">

      <div class="creator-tag creator-tag-vertical">
        <i class="bi bi-person-fill"></i>
        <span>${char.creator}</span>
      </div>

      <i class="bi ${heartClass} heart${activeClass}" style="${isLoggedIn() ? "" : "display:none;"}"></i>

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


// Affiche une liste de personnages
function renderCharacters(list, favoriteIds) {
  const container = document.querySelector(".characters");
  const results = document.querySelector("#results");
  if (!container) return;

  container.innerHTML = list.map(char => renderCard(char, favoriteIds)).join("");

  if (results) {
    results.innerHTML = list.length === 0
      ? `<p class="message error-message show text-center">Aucun personnage ne correspond à votre recherche.</p>`
      : "";
  }
}


// Gestion des cœurs
function initHearts(favoriteIds) {
  document.addEventListener("click", async (e) => {
    if (!e.target.classList.contains("heart")) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const card = e.target.closest(".card-vertical");
    const id = Number(card.dataset.id);
    const willAdd = !e.target.classList.contains("active");

    const data = await apiToggleFavorite(id, token, willAdd);
    if (!data || !data.success) return;

    if (data.favorite) {
      e.target.classList.add("active");
      e.target.classList.replace("bi-heart", "bi-heart-fill");
      if (!favoriteIds.includes(id)) favoriteIds.push(id);
    } else {
      e.target.classList.remove("active");
      e.target.classList.replace("bi-heart-fill", "bi-heart");
      const i = favoriteIds.indexOf(id);
      if (i !== -1) favoriteIds.splice(i, 1);
    }
  });
}


// Initialise la page : chargement, filtres et favoris
async function initCharacterPage() {
  const container = document.querySelector(".characters");
  if (!container) return;

  const allCharacters = (await apiGetCharacters()).filter(c => c.status === "valid" && c.shared);

  const token = localStorage.getItem("token");
  const favoriteIds = token ? await apiGetFavoriteIds(token) : [];

  const pseudos = [...new Set(allCharacters.map(c => c.creator).filter(Boolean))];

  renderCharacters(allCharacters, favoriteIds);

  const filterBtn = document.querySelector(".filters-form .btn");
  filterBtn?.addEventListener("click", () => {
    renderCharacters(filterCharacters(allCharacters), favoriteIds);
  });

  initAutocomplete(pseudos, () => {
    renderCharacters(filterCharacters(allCharacters), favoriteIds);
  });

  initHearts(favoriteIds);
}


// Test
export function filterPseudosForTest(list, query) {
  return list.filter(p =>
    p.toLowerCase().startsWith(query.toLowerCase())
  );
}


// Lance le js de la page Character quand elle est chargée
function start() {
  initReveal();
  initCustomSelects();
  initDetailsOrigin("character");
  initCharacterPage();
}

if (typeof window !== "undefined") start();
