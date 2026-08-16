import { API_BASE } from "../modules/config.js";
import { initReveal } from "../modules/animations.js";
import { initCustomSelects } from "../modules/forms.js";
import { initAutocomplete } from "../modules/autocomplete.js";
import { initDetailsOrigin } from "../modules/details-origin.js";
import { sanitize } from "../modules/security.js";
import { initConfirmModal, askConfirmDelete } from "../modules/confirm.js";


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

// Récupère l'utilisateur connecté (pour connaître ses rôles)
async function apiGetMe(token) {
  try {
    const res = await fetch(`${API_BASE}/api/me`, {
      headers: { "Authorization": "Bearer " + token }
    });
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    console.error("Erreur API me:", e);
    return null;
  }
}

// Les onglets Employés et Logs sont réservés aux administrateurs
async function isAdmin() {
  const token = localStorage.getItem("token");
  const me = token ? await apiGetMe(token) : null;
  return (me?.roles || []).includes("ROLE_ADMIN");
}

async function initRoleAccess() {
  const admin = await isAdmin();

  if (!admin) {
    document.querySelector('[data-tab="employees"]')?.classList.add('state-disabled');
    document.querySelector('[data-tab="logs"]')?.classList.add('state-disabled');
  }

  return admin;
}


// Modal de motif de refus
let rejectPopup = null;

function initRejectModal() {
  rejectPopup = document.getElementById("reject-popup");
  if (rejectPopup) document.body.appendChild(rejectPopup);
}

// Ouvre le modal et résout le motif saisi
function askRejectReason(title) {
  return new Promise((resolve) => {
    if (!rejectPopup) return resolve(null);

    const textarea = rejectPopup.querySelector("#reject-reason");
    const error = rejectPopup.querySelector("#reject-error");
    const confirmBtn = rejectPopup.querySelector("#reject-confirm");
    const cancelBtn = rejectPopup.querySelector("#reject-cancel");
    const closeBtn = rejectPopup.querySelector(".popup-close");
    const titleEl = rejectPopup.querySelector(".popup-title");

    if (title && titleEl) titleEl.textContent = title;

    textarea.value = "";
    error.style.opacity = "0";
    confirmBtn.classList.add("state-disabled");
    rejectPopup.style.display = "flex";
    document.body.style.overflow = "hidden";
    textarea.focus();

    function validate() {
      const reason = sanitize(textarea.value).trim();

      if (reason.length >= 10) {
        confirmBtn.classList.remove("state-disabled");
        error.style.opacity = "0";
        return true;
      }

      confirmBtn.classList.add("state-disabled");
      error.style.opacity = reason.length > 0 ? "1" : "0";
      return false;
    }

    function cleanup() {
      rejectPopup.style.display = "none";
      document.body.style.overflow = "";
      textarea.removeEventListener("input", validate);
      confirmBtn.removeEventListener("click", onConfirm);
      cancelBtn.removeEventListener("click", onCancel);
      closeBtn.removeEventListener("click", onCancel);
    }

    function onConfirm() {
      if (!validate()) return;
      cleanup();
      resolve(sanitize(textarea.value).trim());
    }

    function onCancel() {
      cleanup();
      resolve(null);
    }

    textarea.addEventListener("input", validate);
    confirmBtn.addEventListener("click", onConfirm);
    cancelBtn.addEventListener("click", onCancel);
    closeBtn.addEventListener("click", onCancel);
  });
}


// Section: Character

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

async function apiUpdateStatus(id, status, token) {
  const res = await fetch(`${API_BASE}/api/characters/` + id + "/status", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ status })
  });

  return res.json();
}

async function apiRejectCharacter(id, reason, token) {
  const res = await fetch(`${API_BASE}/api/characters/` + id + "/reject", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ reason })
  });

  return res.json();
}

async function apiDeleteCharacter(id, token) {
  const res = await fetch(`${API_BASE}/api/characters/` + id, {
    method: "DELETE",
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
      const reason = await askRejectReason("Refuser le personnage");
      if (!reason) return;

      const data = await apiRejectCharacter(id, reason, token);
      if (data && data.success) {
        characters = characters.filter(c => c.id !== id);
        renderCharacters(filterCharacters(characters));
      }
      return;
    }

    if (e.target.classList.contains("action-delete")) {
      const ok = await askConfirmDelete("Supprimer le personnage");
      if (!ok) return;

      const data = await apiDeleteCharacter(id, token);
      if (data && data.success) {
        characters = characters.filter(c => c.id !== id);
        renderCharacters(filterCharacters(characters));
      }
      return;
    }
  });
}


// Section: Accessory

// Appels API
async function apiGetAccessories() {
  try {
    const res = await fetch(`${API_BASE}/api/accessories`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.accessories || [];
  } catch (e) {
    console.error("Erreur API accessories:", e);
    return [];
  }
}

async function apiToggleAccessoryActive(id, token) {
  const res = await fetch(`${API_BASE}/api/accessories/` + id + "/active", {
    method: "PATCH",
    headers: { "Authorization": "Bearer " + token }
  });

  return res.json();
}

async function apiDeleteAccessory(id, token) {
  const res = await fetch(`${API_BASE}/api/accessories/` + id, {
    method: "DELETE",
    headers: { "Authorization": "Bearer " + token }
  });

  return res.json();
}


// Récupère les types d'accessoires
async function apiGetAccessoryTypes() {
  try {
    const res = await fetch(`${API_BASE}/api/accessory-types`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.types || [];
  } catch (e) {
    console.error("Erreur API accessory-types:", e);
    return [];
  }
}

async function apiGetRarities() {
  try {
    const res = await fetch(`${API_BASE}/api/rarities`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.rarities || [];
  } catch (e) {
    console.error("Erreur API rarities:", e);
    return [];
  }
}


// Tables de correspondance pour les labels des types et des raretés
let accessoryTypeLabels = {};
let accessoryRarityLabels = {};

async function loadAccessoryLabels() {
  const [types, rarities] = await Promise.all([
    apiGetAccessoryTypes(),
    apiGetRarities()
  ]);

  accessoryTypeLabels = Object.fromEntries(types.map(t => [t.value, t.label]));
  accessoryRarityLabels = Object.fromEntries(rarities.map(r => [r.value, r.label]));
}


// Le filtre statut correspond à l'état actif / inactif de l'accessoire
function matchAccessoryStatus(active, filter) {
  if (filter === "") return true;
  return filter === "active" ? active : !active;
}


// Filtre les accessoires selon la rareté, le statut et la date
function filterAccessories(accessories) {
  const rarity = getSelectValue("rarity-filter-accessories");
  const status = getSelectValue("status-filter-accessories");
  const date = getSelectValue("date-filter-accessories");

  return accessories.filter(acc => {
    const matchRarity = rarity === "" || acc.rarity === rarity;
    const matchStatus = matchAccessoryStatus(acc.active, status);
    const matchCreated = matchDate(acc.createdAt, date);

    return matchRarity && matchStatus && matchCreated;
  });
}


// Construit la carte d'un accessoire
function renderAccessoryCard(acc) {
  return `
    <article class="card-horizontal" data-id="${acc.id}">
      <div class="card-img-wrapper">
        <img src="${acc.image}" alt="${acc.name}" class="card-img">
      </div>
      <div class="card-content">
        <h3 class="card-name">${acc.name}</h3>
        <div class="status-item">
          <span class="label">Type :</span>
          <div class="status-value">
            <span class="status status-type-accessory">${accessoryTypeLabels[acc.type] || acc.type}</span>
          </div>
        </div>
        <div class="rarity-item">
          <span class="label">Rareté :</span>
          <div class="rarity-value">
            <span class="dot dot-${acc.rarity}"></span>
            <span class="value">${accessoryRarityLabels[acc.rarity] || acc.rarity}</span>
          </div>
        </div>
      </div>
      <div class="card-actions">
        <a href="accessory-details?id=${acc.id}" class="action-modifier">Description</a>
        <span>|</span>
        <a class="action-duplicate">${acc.active ? "Désactiver" : "Activer"}</a>
        <span>|</span>
        <a class="action-delete">Supprimer</a>
      </div>
    </article>
  `;
}


// Affiche une liste d'accessoires
function renderAccessories(list) {
  const container = document.querySelector("#accessories .card-container");
  const results = document.querySelector("#results-accessories");
  if (!container) return;

  container.innerHTML = list.map(renderAccessoryCard).join("");

  if (results) {
    results.innerHTML = list.length === 0
      ? `<p class="message error-message show text-center">Aucun accessoire ne correspond à votre recherche.</p>`
      : "";
  }
}


// Récupère la liste des accessoires, gère l'activation et la suppression
async function initAccessoriesSection() {
  const container = document.querySelector("#accessories .card-container");
  if (!container) return;

  const token = localStorage.getItem("token");

  await loadAccessoryLabels();

  let accessories = await apiGetAccessories();

  renderAccessories(accessories);

  const filterBtn = document.querySelector("#accessories .filters-form .btn");
  filterBtn?.addEventListener("click", () => {
    renderAccessories(filterAccessories(accessories));
  });

  container.addEventListener("click", async (e) => {
    const card = e.target.closest(".card-horizontal");
    if (!card) return;

    const id = Number(card.dataset.id);

    if (e.target.classList.contains("action-duplicate")) {
      const data = await apiToggleAccessoryActive(id, token);
      if (data && data.success) {
        accessories = accessories.map(a => a.id === id ? { ...a, active: data.active } : a);
        renderAccessories(filterAccessories(accessories));
      }
      return;
    }

    if (e.target.classList.contains("action-delete")) {
      const ok = await askConfirmDelete("Supprimer l'accessoire");
      if (!ok) return;

      const data = await apiDeleteAccessory(id, token);
      if (data && data.success) {
        accessories = accessories.filter(a => a.id !== id);
        renderAccessories(filterAccessories(accessories));
      }
      return;
    }
  });
}


// Section: Comment

// Appels API
async function apiGetComments() {
  try {
    const res = await fetch(`${API_BASE}/api/comments`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.comments || [];
  } catch (e) {
    console.error("Erreur API comments:", e);
    return [];
  }
}

async function apiGetComment(id) {
  try {
    const res = await fetch(`${API_BASE}/api/comments/` + id);
    if (!res.ok) return null;
    const data = await res.json();
    return data.comment;
  } catch (e) {
    console.error("Erreur API get-comment:", e);
    return null;
  }
}

async function apiUpdateCommentStatus(id, status, token) {
  const res = await fetch(`${API_BASE}/api/comments/` + id + "/status", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ status })
  });

  return res.json();
}

async function apiRejectComment(id, reason, token) {
  const res = await fetch(`${API_BASE}/api/comments/` + id + "/reject", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ reason })
  });

  return res.json();
}

async function apiDeleteComment(id, token) {
  const res = await fetch(`${API_BASE}/api/comments/` + id, {
    method: "DELETE",
    headers: { "Authorization": "Bearer " + token }
  });

  return res.json();
}


// Le filtre "validated" correspond au statut "valid" côté API
function matchCommentStatus(status, filter) {
  if (filter === "") return true;
  return status === (filter === "validated" ? "valid" : filter);
}


// Filtre les commentaires selon le pseudo, le statut et la date
function filterComments(comments) {
  const pseudo = document.querySelector("#pseudo-input-comment")?.value.trim().toLowerCase() || "";
  const status = getSelectValue("status-filter-comment");
  const date = getSelectValue("date-filter-comment");

  return comments.filter(c => {
    const matchPseudo = pseudo === "" || (c.author || "").toLowerCase().includes(pseudo);
    const matchStatus = matchCommentStatus(c.status, status);
    const matchCreated = matchDate(c.createdAt, date);

    return matchPseudo && matchStatus && matchCreated;
  });
}


// Badge de statut
function commentStatusBadge(status) {
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


// Construit la carte d'un commentaire
function renderCommentCard(c) {
  return `
    <article class="card-horizontal" data-id="${c.id}">
      <div class="creator-tag creator-tag-horizontal">
        <i class="bi bi-person-fill"></i>
        <span>${c.author}</span>
      </div>
      <div class="card-img-wrapper">
        <img src="${c.character.image}" alt="${c.character.name}" class="card-img">
      </div>
      <div class="card-content">
        <h3 class="card-name">${c.character.name}</h3>
        ${commentStatusBadge(c.status)}
        <div class="card-buttons">
          <button class="btn btn-secondary action-view">Voir le commentaire</button>
        </div>
      </div>
      <div class="card-actions">
        <a class="action-delete">Supprimer</a>
      </div>
    </article>
  `;
}


// Affiche une liste de commentaires
function renderComments(list) {
  const container = document.querySelector("#comments .card-container");
  const results = document.querySelector("#results-comment");
  if (!container) return;

  container.innerHTML = list.map(renderCommentCard).join("");

  if (results) {
    results.innerHTML = list.length === 0
      ? `<p class="message error-message show text-center">Aucun commentaire ne correspond à votre recherche.</p>`
      : "";
  }
}


// Met à jour le statut d'un commentaire dans la liste locale
function updateLocalCommentStatus(comments, id, status) {
  return comments.map(c => c.id === id ? { ...c, status } : c);
}


// Ouvre le popup avec le détail d'un commentaire
function fillCommentPopup(popup, comment) {
  const popupPseudo = document.getElementById("popup-pseudo");
  const popupText = document.getElementById("popup-text");
  const popupStars = document.getElementById("popup-stars");

  popupPseudo.textContent = comment.author;
  popupText.value = comment.message;

  popupStars.querySelectorAll("i").forEach(star => {
    const value = parseInt(star.dataset.value);
    if (value <= comment.rating) {
      star.classList.remove("bi-star");
      star.classList.add("bi-star-fill");
    } else {
      star.classList.remove("bi-star-fill");
      star.classList.add("bi-star");
    }
  });

  popup.classList.remove("popup-pending", "popup-valid", "popup-refused");
  popup.classList.add("popup-" + comment.status);

  popup.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function closeCommentPopup(popup) {
  popup.style.display = "none";
  document.body.style.overflow = "";
  popup.classList.remove("popup-pending", "popup-valid", "popup-refused");
}


// Récupère la liste des commentaires, gère la validation et la suppression
async function initCommentsSection() {
  const container = document.querySelector("#comments .card-container");
  if (!container) return;

  const token = localStorage.getItem("token");

  let comments = await apiGetComments();

  const pseudos = [...new Set(comments.map(c => c.author).filter(Boolean))];

  renderComments(comments);

  const filterBtn = document.querySelector("#comments .filters-form .btn");
  filterBtn?.addEventListener("click", () => {
    renderComments(filterComments(comments));
  });

  initAutocomplete(pseudos, () => {
    renderComments(filterComments(comments));
  }, { input: "#pseudo-input-comment", suggestions: "#suggestions-comment" });

  const popup = document.getElementById("comment-popup");
  document.body.appendChild(popup);

  let currentId = null;

  popup.querySelector(".popup-close")?.addEventListener("click", () => closeCommentPopup(popup));

  popup.querySelector(".btn-success")?.addEventListener("click", async () => {
    if (!currentId) return;
    const data = await apiUpdateCommentStatus(currentId, "valid", token);
    if (data && data.success) {
      comments = updateLocalCommentStatus(comments, currentId, "valid");
      renderComments(filterComments(comments));
      closeCommentPopup(popup);
    }
  });

  popup.querySelector(".btn-danger")?.addEventListener("click", async () => {
    if (!currentId) return;
    const id = currentId;
    closeCommentPopup(popup);

    const reason = await askRejectReason("Refuser le commentaire");
    if (!reason) return;

    const data = await apiRejectComment(id, reason, token);
    if (data && data.success) {
      comments = comments.filter(c => c.id !== id);
      renderComments(filterComments(comments));
    }
  });

  container.addEventListener("click", async (e) => {
    const card = e.target.closest(".card-horizontal");
    if (!card) return;

    const id = Number(card.dataset.id);

    if (e.target.classList.contains("action-view")) {
      const comment = await apiGetComment(id);
      if (comment) {
        currentId = id;
        fillCommentPopup(popup, comment);
      }
      return;
    }

    if (e.target.classList.contains("action-delete")) {
      const ok = await askConfirmDelete("Supprimer le commentaire");
      if (!ok) return;

      const data = await apiDeleteComment(id, token);
      if (data && data.success) {
        comments = comments.filter(c => c.id !== id);
        renderComments(filterComments(comments));
      }
      return;
    }
  });
}


// Section: Player

// Appels API
async function apiGetPlayers() {
  try {
    const res = await fetch(`${API_BASE}/api/players`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.players || [];
  } catch (e) {
    console.error("Erreur API players:", e);
    return [];
  }
}

async function apiUpdatePlayerStatus(id, status, token) {
  const res = await fetch(`${API_BASE}/api/players/` + id + "/status", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ status })
  });

  return res.json();
}

async function apiDeletePlayer(id, token) {
  const res = await fetch(`${API_BASE}/api/players/` + id, {
    method: "DELETE",
    headers: { "Authorization": "Bearer " + token }
  });

  return res.json();
}


// Le filtre correspond à l'état du compte du joueur
function matchPlayerState(status, filter) {
  if (filter === "") return true;
  return status === filter;
}


// Filtre les joueurs selon le pseudo, l'état du compte et la date
function filterPlayers(players) {
  const pseudo = document.querySelector("#pseudo-input-user")?.value.trim().toLowerCase() || "";
  const state = getSelectValue("account-state-filter-user");
  const date = getSelectValue("date-filter-user");

  return players.filter(p => {
    const matchPseudo = pseudo === "" || (p.pseudo || "").toLowerCase().includes(pseudo);
    const matchState = matchPlayerState(p.status, state);
    const matchCreated = matchDate(p.createdAt, date);

    return matchPseudo && matchState && matchCreated;
  });
}


// Construit la carte d'un joueur
function renderPlayerCard(p) {
  const suspended = p.status === "suspended";

  return `
    <article class="card-vertical" data-id="${p.id}">
      <div class="img-wrapper">
        <i class="bi bi-person-fill user-avatar-icon"></i>
      </div>
      <div class="info-box">
        <h3>${p.pseudo}</h3>
        <div class="actions">
          <button class="btn ${suspended ? "btn-ghost-secondary" : "btn-secondary"} action-suspend">${suspended ? "Réactiver" : "Suspendre"}</button>
          <a class="action-delete">Supprimer</a>
        </div>
      </div>
    </article>
  `;
}


// Affiche une liste de joueurs
function renderPlayers(list) {
  const container = document.querySelector("#players .characters");
  const results = document.querySelector("#results-user");
  if (!container) return;

  container.innerHTML = list.map(renderPlayerCard).join("");

  if (results) {
    results.innerHTML = list.length === 0
      ? `<p class="message error-message show text-center">Aucun joueur ne correspond à votre recherche.</p>`
      : "";
  }
}


// Récupère la liste des joueurs, gère la suspension, la réactivation et la suppression
async function initPlayersSection() {
  const container = document.querySelector("#players .characters");
  if (!container) return;

  const token = localStorage.getItem("token");

  let players = await apiGetPlayers();

  const pseudos = [...new Set(players.map(p => p.pseudo).filter(Boolean))];

  renderPlayers(players);

  const filterBtn = document.querySelector("#players .filters-form .btn");
  filterBtn?.addEventListener("click", () => {
    renderPlayers(filterPlayers(players));
  });

  initAutocomplete(pseudos, () => {
    renderPlayers(filterPlayers(players));
  }, { input: "#pseudo-input-user", suggestions: "#suggestions-user" });

  container.addEventListener("click", async (e) => {
    const card = e.target.closest(".card-vertical");
    if (!card) return;

    const id = Number(card.dataset.id);

    if (e.target.classList.contains("action-suspend")) {
      const current = players.find(p => p.id === id);
      if (!current) return;

      const newStatus = current.status === "suspended" ? "active" : "suspended";
      const data = await apiUpdatePlayerStatus(id, newStatus, token);
      if (data && data.success) {
        players = players.map(p => p.id === id ? { ...p, status: newStatus } : p);
        renderPlayers(filterPlayers(players));
      }
      return;
    }

    if (e.target.classList.contains("action-delete")) {
      const ok = await askConfirmDelete("Supprimer le joueur");
      if (!ok) return;

      const data = await apiDeletePlayer(id, token);
      if (data && data.success) {
        players = players.filter(p => p.id !== id);
        renderPlayers(filterPlayers(players));
      }
      return;
    }
  });
}


// Section: Employee

// Appels API
async function apiGetEmployees() {
  try {
    const res = await fetch(`${API_BASE}/api/employers`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.employers || [];
  } catch (e) {
    console.error("Erreur API employers:", e);
    return [];
  }
}

async function apiUpdateEmployeeStatus(id, status, token) {
  const res = await fetch(`${API_BASE}/api/employers/` + id + "/status", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ status })
  });

  return res.json();
}

async function apiDeleteEmployee(id, token) {
  const res = await fetch(`${API_BASE}/api/employers/` + id, {
    method: "DELETE",
    headers: { "Authorization": "Bearer " + token }
  });

  return res.json();
}


// Le filtre correspond à l'état du compte de l'employé
function matchEmployeeState(status, filter) {
  if (filter === "") return true;
  return status === filter;
}


// Filtre les employés selon le pseudo, l'état du compte et la date
function filterEmployees(employees) {
  const pseudo = document.querySelector("#pseudo-input-employees")?.value.trim().toLowerCase() || "";
  const state = getSelectValue("account-state-filter-employees");
  const date = getSelectValue("date-filter-employees");

  return employees.filter(emp => {
    const matchPseudo = pseudo === "" || (emp.pseudo || "").toLowerCase().includes(pseudo);
    const matchState = matchEmployeeState(emp.status, state);
    const matchCreated = matchDate(emp.createdAt, date);

    return matchPseudo && matchState && matchCreated;
  });
}


// Construit la carte d'un employé
function renderEmployeeCard(emp) {
  const suspended = emp.status === "suspended";

  return `
    <article class="card-vertical" data-id="${emp.id}">
      <div class="img-wrapper">
        <i class="bi bi-person-fill user-avatar-icon"></i>
      </div>
      <div class="info-box">
        <h3>${emp.pseudo}</h3>
        <div class="actions">
          <button class="btn ${suspended ? "btn-ghost-secondary" : "btn-secondary"} action-suspend">${suspended ? "Réactiver" : "Suspendre"}</button>
          <div class="card-actions">
            <a href="reset-employer-password" class="action-edit">Modifier</a>
            <span>|</span>
            <a class="action-delete">Supprimer</a>
          </div>
        </div>
      </div>
    </article>
  `;
}


// Affiche une liste d'employés
function renderEmployees(list) {
  const container = document.querySelector("#employees .characters");
  const results = document.querySelector("#results-employees");
  if (!container) return;

  container.innerHTML = list.map(renderEmployeeCard).join("");

  if (results) {
    results.innerHTML = list.length === 0
      ? `<p class="message error-message show text-center">Aucun employé ne correspond à votre recherche.</p>`
      : "";
  }
}


// Récupère la liste des employés, gère la suspension, la réactivation et la suppression
async function initEmployeesSection() {
  const container = document.querySelector("#employees .characters");
  if (!container) return;

  const token = localStorage.getItem("token");

  let employees = await apiGetEmployees();

  const pseudos = [...new Set(employees.map(emp => emp.pseudo).filter(Boolean))];

  renderEmployees(employees);

  const filterBtn = document.querySelector("#employees .filters-form .btn");
  filterBtn?.addEventListener("click", () => {
    renderEmployees(filterEmployees(employees));
  });

  initAutocomplete(pseudos, () => {
    renderEmployees(filterEmployees(employees));
  }, { input: "#pseudo-input-employees", suggestions: "#suggestions-employees" });

  container.addEventListener("click", async (e) => {
    const card = e.target.closest(".card-vertical");
    if (!card) return;

    const id = Number(card.dataset.id);

    if (e.target.classList.contains("action-suspend")) {
      const current = employees.find(emp => emp.id === id);
      if (!current) return;

      const newStatus = current.status === "suspended" ? "active" : "suspended";
      const data = await apiUpdateEmployeeStatus(id, newStatus, token);
      if (data && data.success) {
        employees = employees.map(emp => emp.id === id ? { ...emp, status: newStatus } : emp);
        renderEmployees(filterEmployees(employees));
      }
      return;
    }

    if (e.target.classList.contains("action-delete")) {
      const ok = await askConfirmDelete("Supprimer l'employé");
      if (!ok) return;

      const data = await apiDeleteEmployee(id, token);
      if (data && data.success) {
        employees = employees.filter(emp => emp.id !== id);
        renderEmployees(filterEmployees(employees));
      }
      return;
    }
  });
}


// Section: Logs

// Appels API
async function apiGetLogs(token) {
  try {
    const res = await fetch(`${API_BASE}/api/logs`, {
      headers: { "Authorization": "Bearer " + token }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.logs || [];
  } catch (e) {
    console.error("Erreur API logs:", e);
    return [];
  }
}


// Le filtre correspond au type d'utilisateur qui a effectué l'action
function matchLogType(userType, filter) {
  if (filter === "") return true;
  return userType === filter;
}


// Le filtre correspond à la catégorie d'action enregistrée
function matchLogAction(action, filter) {
  if (filter === "") return true;
  return action === filter;
}


// Filtre les logs selon le type d'utilisateur, l'action et la date
function filterLogs(logs) {
  const type = getSelectValue("type-filter-logs");
  const action = getSelectValue("status-filter-logs");
  const date = getSelectValue("date-filter-logs");

  return logs.filter(log => {
    const matchType = matchLogType(log.userType, type);
    const matchAction = matchLogAction(log.action, action);
    const matchCreated = matchDate(log.createdAt, date);

    return matchType && matchAction && matchCreated;
  });
}


// Formate une date ISO en "JJ/MM/AAAA - HH:MM"
function formatLogDate(createdAt) {
  if (!createdAt) return "";

  const date = new Date(createdAt);
  const pad = n => String(n).padStart(2, "0");

  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} - ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}


// Construit la carte d'un log
function renderLogCard(log) {
  return `
    <article class="card-horizontal card-log">
      <div class="creator-tag creator-tag-horizontal">
        <i class="bi bi-person-fill"></i>
        <span>${log.actorPseudo}</span>
      </div>
      <div class="card-content">
        <h3 class="card-name">${log.userTypeLabel}</h3>
        <div class="log-type">
          <span class="label">Type d'utilisateur :</span>
          <div class="log-value">
            <span class="status status-type-accessory log-action">${log.label}</span>
          </div>
        </div>
        <div class="log-message">
          <div class="log-value">
            <span class="log-text">${log.message}</span>
          </div>
        </div>
        <div class="log-date">
          <div class="log-date-value">
            <span class="log-text">${formatLogDate(log.createdAt)}</span>
          </div>
        </div>
      </div>
    </article>
  `;
}


// Affiche une liste de logs
function renderLogs(list) {
  const container = document.querySelector("#logs .logs-container");
  const results = document.querySelector("#results-logs");
  if (!container) return;

  container.innerHTML = list.map(renderLogCard).join("");

  if (results) {
    results.innerHTML = list.length === 0
      ? `<p class="message error-message show text-center">Aucun log ne correspond à votre recherche.</p>`
      : "";
  }
}


// Récupère le journal d'activité et gère le filtre dynamique
async function initLogsSection() {
  const container = document.querySelector("#logs .logs-container");
  if (!container) return;

  const token = localStorage.getItem("token");

  const logs = await apiGetLogs(token);

  renderLogs(logs);

  const filterBtn = document.querySelector("#logs .filters-form .btn");
  filterBtn?.addEventListener("click", () => {
    renderLogs(filterLogs(logs));
  });
}


// Lance le js de la page Management quand elle est chargée
async function start() {
  initReveal();
  initCustomSelects();
  initDetailsOrigin("management");
  initRejectModal();
  initConfirmModal();
  initCharactersSection();
  initAccessoriesSection();
  initCommentsSection();
  initPlayersSection();

  // Les sections Employés et Logs sont réservées aux administrateurs
  if (await initRoleAccess()) {
    initEmployeesSection();
    initLogsSection();
  }
}

if (typeof window !== "undefined") start();
