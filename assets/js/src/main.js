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


// Gestion du lien Connexion / Déconnexion
function initAuthLink() {
  const authLink = document.querySelector(".menu .auth-link");
  if (!authLink) return;

  function render() {
    const isLogged = localStorage.getItem("userLogged") === "true";

    if (isLogged) {
      authLink.textContent = "Déconnexion";
      authLink.setAttribute("href", "#");
    } else {
      authLink.textContent = "Inscription";
      authLink.setAttribute("href", "sign-up");
    }
  }

  authLink.addEventListener("click", (e) => {
    const isLogged = localStorage.getItem("userLogged") === "true";
    if (!isLogged) return;

    e.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("userLogged");
    render();
    window.location.href = "/";
  });

  render();
}


// Lance le js du Header quand elle est chargée
if (typeof window !== "undefined") {
  initBurger();
  initAuthLink();
}