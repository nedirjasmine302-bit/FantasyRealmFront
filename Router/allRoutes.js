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
  new Route("/reset-password", "Changer de mot de passe", "/pages/reset-password.html","/assets/js/src/reset-password.js"),
  new Route("/employer-sign-up", "Créer un compte employeur", "/pages/employer-sign-up.html","/assets/js/src/employer-sign-up.js"),
  new Route("/reset-employer-password", "Réinitialisation mot de passe employé", "/pages/reset-employer-password.html","/assets/js/src/reset-employer-password.js"),
  new Route("/character-details", "Détails d'un personnage", "/pages/character-details.html","/assets/js/src/character-details.js"),
  new Route("/create-accessory", "Créer un accessoire", "/pages/create-accessory.html","/assets/js/src/create-accessory.js"),
  new Route("/accessory-details", "Détails d'un accessoire", "/pages/accessory-details.html","/assets/js/src/accessory-details.js"),
  new Route("/management", "Gestion de la plateforme", "/pages/management.html","/assets/js/src/management.js"),
  new Route("/mentions-legales", "Mentions légales", "/pages/mentions-legales.html","/assets/js/src/legal.js"),
  new Route("/conditions-generales-de-vente", "Conditions Générales de Vente", "/pages/conditions-generales-de-vente.html","/assets/js/src/legal.js"),
  new Route("/politique-de-confidentialite", "Politique de confidentialité", "/pages/politique-de-confidentialite.html","/assets/js/src/legal.js")];
//Le titre s'affiche comme ceci : Route.titre - websitename
export const websiteName = "FantasyRealm Online";