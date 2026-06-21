import { initReveal } from "../modules/animations.js";
import { initCustomSelects } from "../modules/forms.js";
import { sanitize } from "../modules/security.js";


// Infomation sur le personnage (Données fictives // Besoin API)
function initCharacterData() {
  const fakeData = {
    image: "/assets/images/page_character/Aelyra.webp",
    name: "Aldren Stormblade",
    gender: "warrior",
    description: "Un guerrier légendaire connu pour sa force et son courage.",
    hairColor: "brun",
    eyeColor: "vert",
    skinColor: "medium",
    mouthShape: "normale",
    eyeShape: "amande",
    noseShape: "fin",
    armor: "shadow-hide",
    weapon: "blade-of-fate",
    relique: "time-relic"
  };

  const previewImage = document.getElementById("previewImage");
  const uploadBox = document.getElementById("uploadBox");
  const uploadPreview = document.getElementById("uploadPreview");

  if (previewImage) {
    previewImage.src = fakeData.image;
    uploadBox?.classList.add("hidden");
    uploadPreview?.classList.add("active");
  }

  setValue("#name", fakeData.name);
  setValue("#description", fakeData.description);

  setSelect("#gender", fakeData.gender);
  setSelect("#hairColor", fakeData.hairColor);
  setSelect("#eyeColor", fakeData.eyeColor);
  setSelect("#skinColor", fakeData.skinColor);
  setSelect("#mouthShape", fakeData.mouthShape);
  setSelect("#eyeShape", fakeData.eyeShape);
  setSelect("#noseShape", fakeData.noseShape);
  setSelect("#armor", fakeData.armor);
  setSelect("#weapon", fakeData.weapon);
  setSelect("#relique", fakeData.relique);

  disableAllFields();
}

function setValue(selector, value) {
  const el = document.querySelector(selector);
  if (!el) return;
  el.value = value;
}

function setSelect(selector, value) {
  const select = document.querySelector(selector);
  if (!select) return;

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


// Commentaire écrit (Données fictives // Besoin API)
function initCommentsCarousel() {
  const comments = [
    {
      author: "Little_Moon",
      date: "05/03/2026",
      text: "Wow, ton perso est incroyable ! J’adore tous les détails, du look à la personnalité.",
      stars: 4,
      validated: true
    },
    {
      author: "ShadowFox",
      date: "12/03/2026",
      text: "Très stylé ! L’armure et l’arme vont parfaitement ensemble.",
      stars: 5,
      validated: true
    },
    {
      author: "Elyndra",
      date: "20/03/2026",
      text: "Belle création ! La description est super immersive.",
      stars: 4,
      validated: true
    }
  ];

  const validComments = comments.filter(c => c.validated);

  let index = 0;

  const authorEl = document.querySelector(".comment-author");
  const dateEl = document.querySelector(".comment-date");
  const textEl = document.querySelector(".comment-text");
  const starsEl = document.querySelector(".comment-stars");

  const prevBtn = document.querySelector(".carousel-btn.prev");
  const nextBtn = document.querySelector(".carousel-btn.next");

  if (!authorEl || !prevBtn || !nextBtn) return;

function renderComment(i) {
  const c = validComments[i];

  authorEl.textContent = `Commentaire de : ${c.author}`;
  dateEl.textContent = `Publié le : ${c.date}`;
  textEl.textContent = c.text;

  starsEl.innerHTML = "";

  for (let s = 1; s <= 5; s++) {
    if (s <= c.stars) {
      starsEl.innerHTML += `<i class="bi bi-star-fill"></i>`;
    } else {
      starsEl.innerHTML += `<i class="bi bi-star"></i>`;
    }
  }
}

  prevBtn.addEventListener("click", () => {
    index = (index - 1 + validComments.length) % validComments.length;
    renderComment(index);
  });

  nextBtn.addEventListener("click", () => {
    index = (index + 1) % validComments.length;
    renderComment(index);
  });

  renderComment(index);
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
function updateFavoriteButton(isLoggedIn) {
  const favBtn = document.getElementById("favBtn");
  if (!favBtn) return;

  if (isLoggedIn) {
    favBtn.classList.remove("state-disabled");
  } else {
    favBtn.classList.add("state-disabled");
  }
}

const isLoggedIn = true;


// Sécurise et valide uniquement le commentaire
function initCommentSecurity() {
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
      } else {
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

  publishBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (!validate()) return;

    const card = publishBtn.closest(".add-comment-card");

    const oldMsg = card.querySelector(".success-message");
    if (oldMsg) oldMsg.remove();

    const success = document.createElement("p");
    success.textContent = "Commentaire envoyé avec succès !";
    success.classList.add("message", "success-message", "success-message-character");

    card.appendChild(success);

    setTimeout(() => success.classList.add("show"), 10);

    textarea.value = "";
    touched = false;

    const resetEvent = new Event("resetRating");
    document.dispatchEvent(resetEvent);

    validate();

    setTimeout(() => {
      success.classList.remove("show");
      setTimeout(() => success.remove(), 300);
    }, 2000);
  });
}


// Pour ajouter ou supprimer des favoris le personnage
function initFavoriteToggle() {
  const favBtn = document.getElementById("favBtn");
  if (!favBtn) return;

  let isFavorite = false;

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

  favBtn.addEventListener("click", (e) => {
    e.preventDefault();
    isFavorite = !isFavorite;
    updateBtn();
  });

  updateBtn();
}


// Test
export function validateCommentForTest(message, rating) {
  const sanitized = sanitize(message);
  if (sanitized.trim() === "") return false;
  if (rating === 0) return false;
  return true;
}


// Lance le JS de la page Création de personnage quand elle est chargée
if (typeof window !== "undefined") {
  initReveal();
  initCustomSelects();
  initCharacterData();
  initCommentsCarousel();
  initAddCommentSection();
  updateFavoriteButton(isLoggedIn);
  initCommentSecurity();
  initFavoriteToggle();
}