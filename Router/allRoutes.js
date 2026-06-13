import Route from "./Route.js";
//Définir ici vos routes
export const allRoutes = [
  new Route("/", "Accueil", "/pages/home.html","/assets/js/src/home.js"),
  new Route("/character", "Personnages", "/pages/character.html","/assets/js/src/character.js"),
  new Route("/my-space", "Mon Espace", "/pages/my_space.html","/assets/js/src/my_space.js"),
  new Route("/favoris", "Favoris", "/pages/favoris.html","/assets/js/src/favoris.js"),
  new Route("/create-character", "Créer un personnage", "/pages/create_character.html","/assets/js/src/create_character.js"),
  new Route("/contact", "Contact", "/pages/contact.html","/assets/js/src/contact.js"),
  new Route("/sign-up", "Inscritpion", "/pages/sign_up.html","/assets/js/src/sign_up.js"),
  new Route("/sign-in", "Connexion", "/pages/sign_in.html","/assets/js/src/sign_in.js")];
//Le titre s'affiche comme ceci : Route.titre - websitename
export const websiteName = "FantasyRealm Online";