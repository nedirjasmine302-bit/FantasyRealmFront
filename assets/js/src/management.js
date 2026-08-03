import { initReveal } from "../modules/animations.js";
import { initCustomSelects } from "../modules/forms.js";
import { initAutocomplete } from "../modules/autocomplete.js";


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


// Lance le js de la page Management quand elle est chargée
function start() {
  initReveal();
  initCustomSelects();
  initAutocomplete();
}

if (typeof window !== "undefined") start();
