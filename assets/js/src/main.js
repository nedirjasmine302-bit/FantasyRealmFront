// Animation du burger
// Le click
function initBurger() {
  const burger = document.querySelector(".burger");

  burger.addEventListener("click", () => {
    toggleMenu();
  });
}

// Ouvrir/Fermer
function toggleMenu() {
  const menu = document.querySelector(".menu");
  const navbar = document.querySelector(".navbar");

  if (menu.classList.contains("show")) {
    menu.classList.remove("show");
    menu.classList.add("closing");

    setTimeout(() => {
      menu.classList.remove("closing");
      navbar.classList.remove("menu-open");
    }, 1000);

  } else {
    menu.classList.add("show");
    navbar.classList.add("menu-open");
  }
}


// Lance le js de la page quand elle est chargée
if (typeof window !== "undefined") {
  initBurger();
}