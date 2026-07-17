import { initReveal } from "../modules/animations.js";
import { initCustomSelects } from "../modules/forms.js";
import { initAutocomplete } from "../modules/autocomplete.js";


// Appel API
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


// Affichage des personnages validés
async function initCharacters() {
  const container = document.querySelector(".characters");
  if (!container) return;

  const characters = (await apiGetCharacters()).filter(c => c.status === "valid");

  characters.forEach(char => {
    container.innerHTML += `
      <article class="card-vertical">

        <div class="creator-tag creator-tag-vertical">
          <i class="bi bi-person-fill"></i>
          <span>${char.creator}</span>
        </div>

        <i class="bi bi-heart heart" style="${isLoggedIn ? '' : 'display:none;'}"></i>

        <div class="img-wrapper">
          <img src="${char.image}" alt="${char.name}">
        </div>

        <div class="info-box">
          <h3>${char.name.toUpperCase()}</h3>
          <a href="character-details?id=${char.id}" class="action-details">Détails</a>
        </div>

      </article>
    `;
  });
}


// Utilisateur connecté (via le token stocké à la connexion)
const isLoggedIn = typeof localStorage !== "undefined" && !!localStorage.getItem("token");


// Favoris (Données fictives // Besoin API)
let favoris = [];


// Gestion des cœurs (Données fictives // Besoin API)
function initHearts() {
  document.addEventListener("click", (e) => {
    if (!e.target.classList.contains("heart")) return;

    const card = e.target.closest(".card-vertical");
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