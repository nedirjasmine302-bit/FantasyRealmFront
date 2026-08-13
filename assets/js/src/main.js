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


// Affiche "Mon Espace" uniquement si l'utilisateur est connecté
function initSpaceLink() {
  const spaceItem = document.querySelector(".menu .space-item");
  if (!spaceItem) return;

  const isLogged = localStorage.getItem("userLogged") === "true";
  spaceItem.classList.toggle("d-none", !isLogged);
}


// Récupère l'utilisateur connecté
async function apiGetMe(token) {
  try {
    const res = await fetch("http://localhost:8080/api/me", {
      headers: { "Authorization": "Bearer " + token }
    });
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    console.error("Erreur API me:", e);
    return null;
  }
}


// Affiche "Gestion" uniquement pour les employés et les administrateurs
async function initManagementLink() {
  const managementItem = document.querySelector(".menu .management-item");
  if (!managementItem) return;

  const token = localStorage.getItem("token");
  if (!token) return;

  const me = await apiGetMe(token);
  const roles = me?.roles || [];

  if (roles.includes("ROLE_EMPLOYER") || roles.includes("ROLE_ADMIN")) {
    managementItem.classList.remove("d-none");
  }
}


// Lance le js du Header quand elle est chargée
function start() {
  initBurger();
  initAuthLink();
  initSpaceLink();
  initManagementLink();
}

if (typeof window !== "undefined") start();