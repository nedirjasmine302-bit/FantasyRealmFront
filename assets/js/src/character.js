import { initReveal } from "../modules/animations.js";
import { initCustomSelects } from "../modules/forms.js";
import { initAutocomplete } from "../modules/autocomplete.js";


// Affichage des personnages (Données fictives // Besoin API)
function initCharacters() {
  const characters = [
    { name: "Aelyra", creator: "Little_moon", image: "../assets/images/character/Aelyra.webp" },
    { name: "Kaedor", creator: "Little_moon", image: "../assets/images/character/Kaedor.webp" },
    { name: "Thorn", creator: "jeff.ra", image: "../assets/images/character/Thorn.webp" },
    { name: "Nyxira", creator: "8_Le", image: "../assets/images/character/Nyxira.webp" },
    { name: "Aelyra", creator: "Little_moon", image: "../assets/images/character/Aelyra.webp" },
    { name: "Kaedor", creator: "Little_moon", image: "../assets/images/character/Kaedor.webp" },
    { name: "Thorn", creator: "jeff.ra", image: "../assets/images/character/Thorn.webp" },
    { name: "Nyxira", creator: "8_Le", image: "../assets/images/character/Nyxira.webp" }
  ];

  const container = document.querySelector(".characters");
  if (!container) return;

  characters.forEach(char => {
    container.innerHTML += `
      <article class="character-card">

        <div class="creator-tag">
          <i class="bi bi-person-fill"></i>
          <span>${char.creator}</span>
        </div>

        <i class="bi bi-heart heart" style="${isLoggedIn ? '' : 'display:none;'}"></i>

        <div class="img-wrapper">
          <img src="${char.image}" alt="${char.name}">
        </div>

        <div class="info-box">
          <h3>${char.name.toUpperCase()}</h3>
          <a href="character-details" class="details">Détails</a>
        </div>

      </article>
    `;
  });
}


// Utilisateur connecté (Données fictives // Besoin API)
const isLoggedIn = true;


// Favoris (Données fictives // Besoin API)
let favoris = [];


// Gestion des cœurs (Données fictives // Besoin API)
function initHearts() {
  document.addEventListener("click", (e) => {
    if (!e.target.classList.contains("heart")) return;

    const card = e.target.closest(".character-card");
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
export function filterPseudosForTest(list, query) {
  return list.filter(p =>
    p.toLowerCase().startsWith(query.toLowerCase())
  );
}


// Lance le js de la page Character quand elle est chargée
if (typeof window !== "undefined") {
  initReveal();
  initCustomSelects();
  initAutocomplete();
  initCharacters();
  initHearts();
}