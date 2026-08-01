import { initReveal } from "../modules/animations.js";
import { initCustomSelects } from "../modules/forms.js";
import { sanitize } from "../modules/security.js";
import { initBackReload } from "../modules/back-reload.js";


// Récupère l'id du personnage dans l'URL 
function getCharacterId() {
  return new URLSearchParams(window.location.search).get("id");
}


// Utilisateur connecté 
function isLoggedIn() {
  return !!localStorage.getItem("token");
}


// Appels API
async function apiGetCharacter(id) {
  try {
    const res = await fetch("http://localhost:8080/api/characters/" + id);
    if (!res.ok) return null;
    const data = await res.json();
    return data.character;
  } catch (e) {
    console.error("Erreur API get-character:", e);
    return null;
  }
}

async function apiGetComments(id) {
  try {
    const res = await fetch("http://localhost:8080/api/characters/" + id + "/comments");
    if (!res.ok) return [];
    const data = await res.json();
    return data.comments || [];
  } catch (e) {
    console.error("Erreur API get-comments:", e);
    return [];
  }
}

async function apiPostComment(id, payload, token) {
  const res = await fetch("http://localhost:8080/api/characters/" + id + "/comments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify(payload)
  });

  return res.json();
}

async function apiIsFavorite(id, token) {
  try {
    const res = await fetch("http://localhost:8080/api/favorites", {
      headers: { "Authorization": "Bearer " + token }
    });
    if (!res.ok) return false;
    const data = await res.json();
    return (data.favorites || []).some((f) => String(f.id) === String(id));
  } catch (e) {
    console.error("Erreur API favorites:", e);
    return false;
  }
}

async function apiToggleFavorite(id, token, add) {
  const res = await fetch("http://localhost:8080/api/characters/" + id + "/favorite", {
    method: add ? "POST" : "DELETE",
    headers: { "Authorization": "Bearer " + token }
  });

  return res.json();
}

async function apiGetAccessories() {
  try {
    const res = await fetch("http://localhost:8080/api/accessories");
    if (!res.ok) return [];
    const data = await res.json();
    return data.accessories || [];
  } catch (e) {
    console.error("Erreur API accessories:", e);
    return [];
  }
}


// Construit dynamiquement les options des selects armure / arme / relique
async function buildAccessoryOptions() {
  const accessories = await apiGetAccessories();
  const selectors = { armor: "#armor", weapon: "#weapon", relique: "#relique" };

  Object.entries(selectors).forEach(([type, selector]) => {
    const optionsBox = document.querySelector(selector + " .custom-options");
    if (!optionsBox) return;

    optionsBox.innerHTML = accessories
      .filter(a => a.type === type)
      .map(a => `<span class="custom-option" data-value="${a.id}" data-rarity="${a.rarity}"><span class="dot dot-${a.rarity}"></span> ${a.name}</span>`)
      .join("");
  });
}


// Affiche les informations du personnage (lecture seule)
function fillCharacter(character) {
  const previewImage = document.getElementById("previewImage");
  const uploadBox = document.getElementById("uploadBox");
  const uploadPreview = document.getElementById("uploadPreview");

  if (previewImage && character.image) {
    previewImage.src = character.image;
    uploadBox?.classList.add("hidden");
    uploadPreview?.classList.add("active");
  }

  setValue("#name", character.name);
  setValue("#description", character.description);

  setSelect("#gender", character.type);

  const app = character.appearance || {};
  setSelect("#hairColor", app.hairColor);
  setSelect("#eyeColor", app.eyeColor);
  setSelect("#skinColor", app.skinColor);
  setSelect("#mouthShape", app.mouthShape);
  setSelect("#eyeShape", app.eyeShape);
  setSelect("#noseShape", app.noseShape);

  setSelect("#armor", character.armor);
  setSelect("#weapon", character.weapon);
  setSelect("#relique", character.relique);

  disableAllFields();
}

function setValue(selector, value) {
  const el = document.querySelector(selector);
  if (!el) return;
  el.value = value ?? "";
}

function setSelect(selector, value) {
  const select = document.querySelector(selector);
  if (!select || !value) return;

  const trigger = select.querySelector(".trigger-text");
  const option = select.querySelector(`.custom-option[data-value="${value}"]`);

  if (trigger && option) {
    trigger.innerHTML = option.innerHTML;
    trigger.dataset.value = value;
  }
}

function disableAllFields() {
  const inputs = document.querySelectorAll("input, textarea");

  inputs.forEach(i => {
    if (i.id === "userComment") return;

    i.setAttribute("readonly", true);
    i.setAttribute("disabled", true);
  });

  const selects = document.querySelectorAll(".custom-select");
  selects.forEach(s => {
    s.classList.add("disabled");
    s.style.pointerEvents = "none";
  });
}


// Affiche les commentaires validés dans le carrousel
function initCommentsCarousel(comments) {
  const authorEl = document.querySelector(".comment-author");
  const dateEl = document.querySelector(".comment-date");
  const textEl = document.querySelector(".comment-text");
  const starsEl = document.querySelector(".comment-stars");

  const prevBtn = document.querySelector(".carousel-btn.prev");
  const nextBtn = document.querySelector(".carousel-btn.next");

  if (!authorEl || !prevBtn || !nextBtn) return;

  if (comments.length === 0) {
    prevBtn.style.display = "none";
    nextBtn.style.display = "none";
    starsEl.innerHTML = "";
    authorEl.textContent = "";
    dateEl.textContent = "";
    textEl.textContent = "Aucun avis pour le moment.";
    return;
  }

  let index = 0;

  function renderComment(i) {
    const c = comments[i];

    authorEl.textContent = `Commentaire de : ${c.author}`;
    dateEl.textContent = `Publié le : ${formatDate(c.createdAt)}`;
    textEl.textContent = c.message;

    starsEl.innerHTML = "";

    for (let s = 1; s <= 5; s++) {
      if (s <= c.rating) {
        starsEl.innerHTML += `<i class="bi bi-star-fill"></i>`;
      } else {
        starsEl.innerHTML += `<i class="bi bi-star"></i>`;
      }
    }
  }

  prevBtn.addEventListener("click", () => {
    index = (index - 1 + comments.length) % comments.length;
    renderComment(index);
  });

  nextBtn.addEventListener("click", () => {
    index = (index + 1) % comments.length;
    renderComment(index);
  });

  renderComment(index);
}


// Formate une date ISO en JJ/MM/AAAA
function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("fr-FR");
}


// Gère les étoiles
function initAddCommentSection() {
  const stars = document.querySelectorAll("#ratingStars i");
  let selectedRating = 0;

  function updateStarsDisplay() {
    stars.forEach((s, index) => {
      if (index < selectedRating) {
        s.classList.remove("bi-star");
        s.classList.add("bi-star-fill");
      } else {
        s.classList.remove("bi-star-fill");
        s.classList.add("bi-star");
      }
    });
  }

  stars.forEach(star => {
    star.addEventListener("click", () => {
      selectedRating = parseInt(star.dataset.value);
      updateStarsDisplay();

      const event = new Event("ratingChanged");
      document.dispatchEvent(event);
    });
  });

  document.addEventListener("resetRating", () => {
    selectedRating = 0;
    updateStarsDisplay();
  });

  document.getSelectedRating = () => selectedRating;
}


// Active ou désactive le bouton Favoris selon la connexion
function updateFavoriteButton(isLogged) {
  const favBtn = document.getElementById("favBtn");
  if (!favBtn) return;

  if (isLogged) {
    favBtn.classList.remove("state-disabled");
  } else {
    favBtn.classList.add("state-disabled");
  }
}


// Sécurise, valide et envoie le commentaire
function initCommentSecurity(characterId) {
  const textarea = document.getElementById("userComment");
  const publishBtn = document.getElementById("publishComment");

  if (!textarea || !publishBtn) return;

  const error = document.createElement("p");
  error.classList.add("input-error", "input-error-character");
  textarea.insertAdjacentElement("afterend", error);

  let touched = false;

  function showError(msg) {
    error.textContent = msg;
    error.style.opacity = "1";
  }

  function hideError() {
    error.textContent = "";
    error.style.opacity = "0";
  }

  function validate() {
    const message = sanitize(textarea.value);
    const rating = document.getSelectedRating();

    let valid = true;

    if (touched) {
      if (message.trim() === "") {
        showError("Veuillez écrire un commentaire");
        valid = false;
      }
      else if (message.trim().length < 30) {
        showError("Le commentaire doit contenir au moins 30 caractères");
        valid = false;
      }
      else {
        hideError();
      }
    }

    if (rating === 0) valid = false;

    if (valid) {
      publishBtn.classList.remove("state-disabled");
    } else {
      publishBtn.classList.add("state-disabled");
    }

    return valid;
  }

  textarea.addEventListener("input", () => {
    touched = true;
    validate();
  });

  document.addEventListener("ratingChanged", () => {
    touched = true;
    validate();
  });

  publishBtn.classList.add("state-disabled");

  publishBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const card = publishBtn.closest(".add-comment-card");

    const oldMsg = card.querySelector(".message");
    if (oldMsg) oldMsg.remove();

    const token = localStorage.getItem("token");
    if (!token) {
      showMessage(card, "Vous devez être connecté pour laisser un commentaire.", "error-message");
      return;
    }

    const payload = {
      message: sanitize(textarea.value),
      rating: document.getSelectedRating()
    };

    const data = await apiPostComment(characterId, payload, token);

    if (!data.success) {
      showMessage(card, data.message || "Une erreur est survenue.", "error-message");
      return;
    }

    showMessage(card, "Commentaire envoyé avec succès !", "success-message");

    textarea.value = "";
    touched = false;

    const resetEvent = new Event("resetRating");
    document.dispatchEvent(resetEvent);

    validate();
  });

  function showMessage(card, text, type) {
    const msg = document.createElement("p");
    msg.textContent = text;
    msg.classList.add("message", type, "success-message-character");
    card.appendChild(msg);

    setTimeout(() => msg.classList.add("show"), 10);

    setTimeout(() => {
      msg.classList.remove("show");
      setTimeout(() => msg.remove(), 300);
    }, 2000);
  }
}


// Pour ajouter ou retirer le personnage des favoris
async function initFavoriteToggle(characterId) {
  const favBtn = document.getElementById("favBtn");
  if (!favBtn) return;

  const token = localStorage.getItem("token");

  if (!token) return;

  let isFavorite = await apiIsFavorite(characterId, token);

  function updateBtn() {
    if (isFavorite) {
      favBtn.textContent = "Supprimer des favoris";
      favBtn.classList.remove("btn-secondary");
      favBtn.classList.add("btn-ghost-secondary");
    } else {
      favBtn.textContent = "Ajouter au favoris";
      favBtn.classList.remove("btn-ghost-secondary");
      favBtn.classList.add("btn-secondary");
    }
  }

  favBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const data = await apiToggleFavorite(characterId, token, !isFavorite);

    if (data && data.success) {
      isFavorite = data.favorite;
      updateBtn();
    }
  });

  updateBtn();
}


// Charge le personnage, ses commentaires validés et l'état des favoris
async function initCharacterDetails() {
  const id = getCharacterId();
  if (!id) return;

  const character = await apiGetCharacter(id);
  if (character) {
    fillCharacter(character);
  }

  const comments = await apiGetComments(id);
  initCommentsCarousel(comments);

  initAddCommentSection();
  updateFavoriteButton(isLoggedIn());
  initCommentSecurity(id);
  initFavoriteToggle(id);
}


// Test
export function validateCommentForTest(message, rating) {
  const sanitized = sanitize(message);
  if (sanitized !== message) return false;
  if (sanitized.trim() === "") return false;
  if (rating === 0) return false;
  return true;
}


// Lance le JS de la page Character-details quand elle est chargée
async function start() {
  initReveal();
  await buildAccessoryOptions();
  initCustomSelects();
  initBackReload();
  initCharacterDetails();
}

if (typeof window !== "undefined") {
  start();
}
