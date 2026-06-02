import Route from "./Route.js";
//Définir ici vos routes
export const allRoutes = [
  new Route("/", "Accueil", "/pages/home.html","/assets/js/home.js"),
  new Route("/character", "Personnages", "/pages/character.html","/assets/js/character.js"),
  new Route("/my_space", "Mon Espace", "/pages/my_space.html","/assets/js/my_space.js")];
//Le titre s'affiche comme ceci : Route.titre - websitename
export const websiteName = "FantasyRealm Online";