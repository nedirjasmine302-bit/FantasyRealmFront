import { initReveal } from "../modules/animations.js";
import { isAuthenticated } from "../modules/auth.js";


// Animation de l'image (Section: About)
function initAboutTilt() {
  const wrapper = document.querySelector(".about-img-wrapper");
  if (!wrapper) return;

  const img = wrapper.querySelector(".about-img");

  wrapper.addEventListener("mousemove", (e) => {
    const rect = wrapper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateY = ((x / rect.width) - 0.5) * 12;
    const rotateX = ((y / rect.height) - 0.5) * -12;

    img.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  });

  wrapper.addEventListener("mouseleave", () => {
    img.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
  });
}


// Animation des cards 
// Le click
function initCards() {
  const cards = document.querySelectorAll(".card-box");

  cards.forEach(card => {
    card.addEventListener("click", () => {
      toggleCard(card);
    });
  });
};

// Ouvrir/Fermer
function toggleCard(card) {
  const item = card.parentElement;
  const detail = card.nextElementSibling;
  const icon = card.querySelector(".toggle");
  const allItems = document.querySelectorAll(".card-item");

  allItems.forEach(otherItem => {
    if (otherItem !== item) {
      otherItem.classList.remove("open");

      const otherBox = otherItem.querySelector(".card-box");
      const otherDetail = otherItem.querySelector(".card-detail");
      const otherIcon = otherItem.querySelector(".toggle");

      otherBox.classList.remove("active");
      otherDetail.classList.remove("show");

      otherIcon.classList.remove("bi-dash");
      otherIcon.classList.add("bi-plus");
    }
  });

  item.classList.toggle("open");
  card.classList.toggle("active");
  detail.classList.toggle("show");

  if (card.classList.contains("active")) {
    icon.classList.remove("bi-plus");
    icon.classList.add("bi-dash");
  } else {
    icon.classList.remove("bi-dash");
    icon.classList.add("bi-plus");
  }
};


// Envoie vers Mon Espace si connecté, sinon vers l'inscription
function initAccountLinks() {
  const links = document.querySelectorAll(".account-link");
  const isLogged = isAuthenticated();

  links.forEach(link => {
    link.setAttribute("href", isLogged ? "my-space" : "sign-up");
  });
}


// Test
export function toggleCardForTest(card) {
  card.active = !card.active;
  return card;
}


// Lance le js de la page Home quand elle est chargée
function start() {
  initReveal();
  initAboutTilt();
  initCards();
  initAccountLinks();
}

if (typeof window !== "undefined") start();
