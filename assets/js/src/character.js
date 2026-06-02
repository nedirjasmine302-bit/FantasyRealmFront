// Animation d'apparition des éléments de la page au scroll
function initReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add("show");
    });
  });

  const elements = document.querySelectorAll(".fade-up, .scale-in, .blur-in");
  elements.forEach(el => observer.observe(el));
}


// Les selects personnalisés dans le filtre
function initCustomSelects() {
  document.querySelectorAll(".custom-select").forEach(select => {
    const trigger = select.querySelector(".custom-select-trigger");

    trigger.addEventListener("click", () => {
      document.querySelectorAll(".custom-select.open").forEach(other => {
        if (other !== select) other.classList.remove("open");
      });
      select.classList.toggle("open");
    });

    select.querySelectorAll(".custom-option").forEach(option => {
      option.addEventListener("click", () => {
        select.querySelector(".trigger-text").textContent = option.textContent;
        select.querySelector(".trigger-text").dataset.value = option.dataset.value;
        select.classList.remove("open");
      });
    });
  });

  document.addEventListener("click", (e) => {
    document.querySelectorAll(".custom-select.open").forEach(select => {
      if (!select.contains(e.target)) select.classList.remove("open");
    });
  });
}


// Complète automatiquement le pseudo (MODE TEST // Besoin API)
function initAutocomplete() {
  const pseudos = [
    "Jasmine", "Jason", "Julien", "Jade",
    "Little_moon", "Kaedor", "Arthas", "Lunaria"
  ];

  const input = document.querySelector("#pseudo-input");
  const suggestionsBox = document.querySelector("#suggestions");

  if (!input || !suggestionsBox) return;

  input.addEventListener("input", () => {
    const query = input.value.toLowerCase();

    if (query.length === 0) {
      suggestionsBox.innerHTML = "";
      suggestionsBox.classList.remove("active");
      return;
    }

    const results = pseudos.filter(p =>
      p.toLowerCase().startsWith(query)
    );

    suggestionsBox.innerHTML = results
      .map(r => `<div class="pseudo-suggestion-item">${r}</div>`)
      .join("");

    suggestionsBox.classList.toggle("active", results.length > 0);

    document.querySelectorAll(".pseudo-suggestion-item").forEach(item => {
      item.addEventListener("click", () => {
        input.value = item.textContent;
        suggestionsBox.innerHTML = "";
        suggestionsBox.classList.remove("active");
      });
    });
  });
}


// Affichage des personnages (MODE TEST // Besoin API)
function initCharacters() {
  const characters = [
    { name: "Aelyra", creator: "Little_moon", image: "../assets/images/page_character/Aelyra.webp" },
    { name: "Kaedor", creator: "Little_moon", image: "../assets/images/page_character/Kaedor.webp" },
    { name: "Thorn", creator: "jeff.ra", image: "../assets/images/page_character/Thorn.webp" },
    { name: "Nyxira", creator: "8_Le", image: "../assets/images/page_character/Nyxira.webp" },
    { name: "Aelyra", creator: "Little_moon", image: "../assets/images/page_character/Aelyra.webp" },
    { name: "Kaedor", creator: "Little_moon", image: "../assets/images/page_character/Kaedor.webp" },
    { name: "Thorn", creator: "jeff.ra", image: "../assets/images/page_character/Thorn.webp" },
    { name: "Nyxira", creator: "8_Le", image: "../assets/images/page_character/Nyxira.webp" }
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
          <a href="#" class="details">Détails</a>
        </div>

      </article>
    `;
  });
}


// Utilisateur connecté (MODE TEST // Besoin API)
const isLoggedIn = true;


// Favoris (MODE TEST // Besoin API)
let favoris = [];


// Gestion des cœurs (MODE TEST // Besoin API)
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


// Test pour la fonction de filtrage des pseudos (pour l'autocomplete)
export function filterPseudosForTest(list, query) {
  return list.filter(p =>
    p.toLowerCase().startsWith(query.toLowerCase())
  );
}


// Lance le js de la page Home quand elle est chargée
if (typeof window !== "undefined") {
initReveal();
initCustomSelects();
initAutocomplete();
initCharacters();
initHearts();
}