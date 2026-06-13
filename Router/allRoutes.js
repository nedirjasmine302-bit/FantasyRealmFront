import Route from "./Route.js";
//Définir ici vos routes
export const allRoutes = [
  new Route("/", "Accueil", "/pages/home.html","/assets/js/src/home.js"),
  new Route("/character", "Personnages", "/pages/character.html","/assets/js/src/character.js"),
  new Route("/my-space", "Mon Espace", "/pages/my-space.html","/assets/js/src/my-space.js"),
  new Route("/favoris", "Favoris", "/pages/favoris.html","/assets/js/src/favoris.js"),
  new Route("/create-character", "Créer un personnage", "/pages/create-character.html","/assets/js/src/create-character.js"),
  new Route("/contact", "Contact", "/pages/contact.html","/assets/js/src/contact.js"),
  new Route("/sign-up", "Inscritpion", "/pages/sign-up.html","/assets/js/src/sign-up.js"),
  new Route("/sign-in", "Connexion", "/pages/sign-in.html","/assets/js/src/sign-in.js"),
  new Route("/forgot-password", "Mot de passe oublié", "/pages/forgot-password.html","/assets/js/src/forgot-password.js"),
  new Route("/reset-password", "Changer de mot de passe", "/pages/reset-password.html","/assets/js/src/reset-password.js")];
//Le titre s'affiche comme ceci : Route.titre - websitename
export const websiteName = "FantasyRealm Online";