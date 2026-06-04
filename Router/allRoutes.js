import Route from "./Route.js";
//Définir ici vos routes
export const allRoutes = [
  new Route("/", "Accueil", "/pages/home.html","/assets/js/src/home.js"),
  new Route("/character", "Personnages", "/pages/character.html","/assets/js/src/character.js"),
  new Route("/my_space", "Mon Espace", "/pages/my_space.html","/assets/js/src/my_space.js"),
  new Route("/favoris", "Favoris", "/pages/favoris.html","/assets/js/src/favoris.js")];
//Le titre s'affiche comme ceci : Route.titre - websitename
export const websiteName = "FantasyRealm Online";