import { initReveal } from "../modules/animations.js";
import { initCustomSelects } from "../modules/forms.js";
import { initAutocomplete } from "../modules/autocomplete.js";
import { initDetailsOrigin } from "../modules/details-origin.js";


// Gestion des onglets
const tabs = document.querySelectorAll('.tab-card');
const sections = document.querySelectorAll('.tab-section');

function activateTab(target) {
  tabs.forEach(t => t.classList.remove('active'));
  sections.forEach(s => s.classList.remove('active'));

  document.querySelector(`[data-tab="${target}"]`)?.classList.add('active');
  document.getElementById(target)?.classList.add('active');
}

function getTargetFromURL() {
  return window.location.hash.replace("#", "");
}

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;
    activateTab(target);
    sessionStorage.setItem("activeTab", target);

    if (window.location.hash) {
      history.replaceState(null, "", window.location.pathname);
    }
  });
});

const initialTab =
  getTargetFromURL() ||
  sessionStorage.getItem("activeTab");

if (initialTab) {
  activateTab(initialTab);
}

if (window.location.hash) {
  history.replaceState(null, "", window.location.pathname);
}


// Reset des onglest au changement de page
document.querySelectorAll('a[href]').forEach(link => {
  link.addEventListener('click', () => {
    sessionStorage.removeItem("activeTab");
  });
});


// Gestion des rôles
const userRole = "admin"; // ou "employer"

if (userRole === "employer") {
  document.querySelector('[data-tab="employees"]').classList.add('state-disabled');
  document.querySelector('[data-tab="logs"]').classList.add('state-disabled');
}


// Activer ou désativer accessoire
document.querySelectorAll('.action-duplicate').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.textContent = btn.textContent === "Désactiver" 
      ? "Activer"
      : "Désactiver";
  });
});


// Pop Up commentaire (Données fictives // Besoin API)
const fakeComments = [
  {
    id: 1,
    pseudo: "Little_moon",
    comment: "Super personnage, j'adore le design et l'histoire !",
    stars: 4
  },
  {
    id: 2,
    pseudo: "DarkWolf",
    comment: "Pas mal, mais je trouve que la description manque de détails.",
    stars: 3
  },
  {
    id: 3,
    pseudo: "Crystaline",
    comment: "Magnifique ! Rien à dire, c'est validé direct.",
    stars: 5
  }
];

const popup = document.getElementById("comment-popup");

document.body.appendChild(popup);

const popupPseudo = document.getElementById("popup-pseudo");
const popupText = document.getElementById("popup-text");
const popupStars = document.getElementById("popup-stars");
const closeBtn = document.querySelector(".popup-close");

if (closeBtn) {
  closeBtn.addEventListener("click", () => {
    popup.style.display = "none";
    document.body.style.overflow = "";

    popup.classList.remove("popup-pending", "popup-valid", "popup-refused");
  });
}

document.querySelectorAll('.card-buttons .btn.btn-secondary').forEach(btn => {
  btn.addEventListener('click', () => {

    const id = parseInt(btn.dataset.id);
    const data = fakeComments.find(c => c.id === id);
    if (!data) return;

    popupPseudo.textContent = data.pseudo;
    popupText.value = data.comment;

    const stars = popupStars.querySelectorAll("i");
    stars.forEach(star => {
      const value = parseInt(star.dataset.value);
      if (value <= data.stars) {
        star.classList.remove("bi-star");
        star.classList.add("bi-star-fill");
      } else {
        star.classList.remove("bi-star-fill");
        star.classList.add("bi-star");
      }
    });

    const card = btn.closest('.card-horizontal');

    popup.classList.remove("popup-pending", "popup-valid", "popup-refused");

    if (card.querySelector('.status-pending')) {
      popup.classList.add('popup-pending');
    }
    if (card.querySelector('.status-valid')) {
      popup.classList.add('popup-valid');
    }
    if (card.querySelector('.status-refused')) {
      popup.classList.add('popup-refused');
    }

    popup.style.display = "flex";
    document.body.style.overflow = "hidden";
  });
});


// Activé ou suspendre un utilisateur
document.addEventListener("click", (e) => {
  if (!e.target.classList.contains("action-suspend")) return;

  const btn = e.target;

  if (btn.classList.contains("btn-secondary")) {
    btn.classList.remove("btn-secondary");
    btn.classList.add("btn-ghost-secondary");
    btn.textContent = "Réactivé";
  }
  else {
    btn.classList.remove("btn-ghost-secondary");
    btn.classList.add("btn-secondary");
    btn.textContent = "Suspendre";
  }
});


// Section: Personnages

// Appels API
async function apiGetCharacters() {
  try {
    const res = await fetch("http://localhost:8080/api/characters");
    if (!res.ok) return [];
    const data = await res.json();
    return data.characters || [];
  } catch (e) {
    console.error("Erreur API characters:", e);
    return [];
  }
}

async function apiUpdateStatus(id, status, token) {
  const res = await fetch("http://localhost:8080/api/characters/" + id + "/status", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ status })
  });

  return res.json();
}

async function apiArchiveCharacter(id, token) {
  const res = await fetch("http://localhost:8080/api/characters/" + id + "/archive", {
    method: "PATCH",
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


// Badge de statut
function characterStatusBadge(status) {
  switch (status) {
    case "pending":
      return `<span class="status status-pending">En attente de validation</span>`;
    case "refused":
      return `<span class="status status-refused">Refusé</span>`;
    case "valid":
      return `<span class="status status-valid">Validé</span>`;
    default:
      return "";
  }
}


// Filtre les personnages selon le pseudo, le statut et la date
function filterCharacters(characters) {
  const pseudo = document.querySelector("#pseudo-input-characters")?.value.trim().toLowerCase() || "";
  const status = getSelectValue("status-filter-characters");
  const date = getSelectValue("date-filter-characters");

  return characters.filter(char => {
    const matchPseudo = pseudo === "" || (char.creator || "").toLowerCase().includes(pseudo);
    const matchStatus = matchCharacterStatus(char.status, status);
    const matchCreated = matchDate(char.createdAt, date);

    return matchPseudo && matchStatus && matchCreated;
  });
}


// Le filtre "validated" correspond au statut "valid" côté API
function matchCharacterStatus(charStatus, filter) {
  if (filter === "") return true;
  return charStatus === (filter === "validated" ? "valid" : filter);
}


// Construit la carte d'un personnage
function renderCharacterCard(char) {
  return `
    <article class="card-horizontal" data-id="${char.id}">
      <div class="creator-tag creator-tag-horizontal">
        <i class="bi bi-person-fill"></i>
        <span>${char.creator}</span>
      </div>
      <div class="card-img-wrapper">
        <img src="${char.image}" alt="${char.name}" class="card-img">
      </div>
      <div class="card-content">
        <h3 class="card-name">${char.name.toUpperCase()}</h3>
        ${characterStatusBadge(char.status)}
        <div class="card-buttons">
          <button class="btn btn-success action-validate">Valider</button>
          <button class="btn btn-danger action-refuse">Refuser</button>
        </div>
      </div>
      <div class="card-actions">
        <a href="character-details?id=${char.id}" class="action-details">Détails</a>
        <span>|</span>
        <a class="action-delete">Supprimer</a>
      </div>
    </article>
  `;
}


// Affiche une liste de personnages
function renderCharacters(list) {
  const container = document.querySelector("#characters .card-container");
  const results = document.querySelector("#results-characters");
  if (!container) return;

  container.innerHTML = list.map(renderCharacterCard).join("");

  if (results) {
    results.innerHTML = list.length === 0
      ? `<p class="message error-message show text-center">Aucun personnage ne correspond à votre recherche.</p>`
      : "";
  }
}


// Met à jour le statut d'un personnage dans la liste locale
function updateLocalStatus(characters, id, status) {
  return characters.map(c => c.id === id ? { ...c, status } : c);
}


// Récupère les demandes de validation, gère le statut et la suppression
async function initCharactersSection() {
  const container = document.querySelector("#characters .card-container");
  if (!container) return;

  const token = localStorage.getItem("token");

  let characters = (await apiGetCharacters()).filter(c => c.status !== "draft" && !c.archivedByEmployer);

  const pseudos = [...new Set(characters.map(c => c.creator).filter(Boolean))];

  renderCharacters(characters);

  const filterBtn = document.querySelector("#characters .filters-form .btn");
  filterBtn?.addEventListener("click", () => {
    renderCharacters(filterCharacters(characters));
  });

  initAutocomplete(pseudos, () => {
    renderCharacters(filterCharacters(characters));
  }, { input: "#pseudo-input-characters", suggestions: "#suggestions-characters" });

  container.addEventListener("click", async (e) => {
    const card = e.target.closest(".card-horizontal");
    if (!card) return;

    const id = Number(card.dataset.id);

    if (e.target.classList.contains("action-validate")) {
      const data = await apiUpdateStatus(id, "valid", token);
      if (data && data.success) {
        characters = updateLocalStatus(characters, id, "valid");
        renderCharacters(filterCharacters(characters));
      }
      return;
    }

    if (e.target.classList.contains("action-refuse")) {
      const data = await apiUpdateStatus(id, "refused", token);
      if (data && data.success) {
        characters = updateLocalStatus(characters, id, "refused");
        renderCharacters(filterCharacters(characters));
      }
      return;
    }

    if (e.target.classList.contains("action-delete")) {
      const data = await apiArchiveCharacter(id, token);
      if (data && data.success) {
        characters = characters.filter(c => c.id !== id);
        renderCharacters(filterCharacters(characters));
      }
      return;
    }
  });
}


// Lance le js de la page Management quand elle est chargée
function start() {
  initReveal();
  initCustomSelects();
  initDetailsOrigin("management");
  initCharactersSection();
}

if (typeof window !== "undefined") start();
