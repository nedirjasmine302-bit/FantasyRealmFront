import { initReveal } from "../modules/animations.js";


// Favoris (Données fictives // Besoin API)
let favoris = [];


// Gestion des cœurs (Données fictives // Besoin API)
function initHearts() {
  document.addEventListener("click", (e) => {
    if (!e.target.classList.contains("heart")) return;

    const card = e.target.closest(".card-horizontal");
    const characterName = card.querySelector("h3").textContent;

    e.target.classList.toggle("active");

    if (e.target.classList.contains("active")) {
      e.target.classList.replace("bi-heart", "bi-heart-fill");
      favoris.push(characterName);
      console.log("Favoris ajoutés :", favoris);
    } else {
      e.target.classList.replace("bi-heart-fill", "bi-heart");
      favoris = favoris.filter(f => f !== characterName);
      console.log("Favoris retirés :", favoris);
    }
  });
}


// Test 
export function toggleFavoriteForTest(fav, name) {
  return fav.includes(name)
    ? fav.filter(f => f !== name)
    : [...fav, name];
}


// Lance le js de la page My-space quand elle est chargée
if (typeof window !== "undefined") {
initReveal();
initHearts();
}