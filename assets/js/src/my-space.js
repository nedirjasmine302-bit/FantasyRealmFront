// Animation d'apparition des éléments de la page au scroll
function initReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      }
    });
  });

  const elements = document.querySelectorAll(".fade-up, .scale-in, .blur-in");

  elements.forEach(el => observer.observe(el));
}


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