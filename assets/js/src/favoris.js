import { initReveal } from "../modules/animations.js";
import { initCustomSelects } from "../modules/forms.js";
import { initAutocomplete } from "../modules/autocomplete.js";


// Utilisateur connecté (Données fictives // Besoin API)
const isLoggedIn = true;


// Favoris (Données fictives // Besoin API)
let favoris = ["Aelyra", "Kaedor", "Nyxira", "Thorn"];


// Affichage des personnages (Données fictives // Besoin API)
function initCharacters() {
  const characters = [
    { name: "Aelyra", creator: "Little_moon", image: "../assets/images/character/Aelyra.webp" },
    { name: "Kaedor", creator: "Little_moon", image: "../assets/images/character/Kaedor.webp" },
    { name: "Thorn", creator: "jeff.ra", image: "../assets/images/character/Thorn.webp" },
    { name: "Nyxira", creator: "8_Le", image: "../assets/images/character/Nyxira.webp" }
  ];

  const container = document.querySelector(".characters");
  if (!container) return;

  const favCharacters = characters.filter(c => favoris.includes(c.name));

  if (favCharacters.length === 0) {
    container.innerHTML = `<p class="no-favorites">Vous n'avez aucun favori.</p>`;
    return;
  }

  favCharacters.forEach(char => {
    container.innerHTML += `
      <article class="card-vertical">

        <div class="creator-tag creator-tag-vertical">
          <i class="bi bi-person-fill"></i>
          <span>${char.creator}</span>
        </div>

        <i class="bi bi-heart-fill heart active" style="${isLoggedIn ? '' : 'display:none;'}"></i>

        <div class="img-wrapper">
          <img src="${char.image}" alt="${char.name}">
        </div>

        <div class="info-box">
          <h3>${char.name.toUpperCase()}</h3>
          <a href="character-details" class="action-details">Détails</a>
        </div>

      </article>
    `;
  });
}


// Gestion des cœurs (Données fictives // Besoin API)
function initHearts() {
  document.addEventListener("click", (e) => {
    if (!e.target.classList.contains("heart")) return;

    const card = e.target.closest(".card-vertical");
    const characterName = card.querySelector("h3").textContent;

    favoris = favoris.filter(f => f !== characterName);
    card.remove();
    console.log("Favoris retirés :", favoris);
  });
}


// Lance le js de la page Favoris quand elle est chargée
if (typeof window !== "undefined") {
  initReveal();
  initCustomSelects();
  initAutocomplete();
  initCharacters();
  initHearts();
}
