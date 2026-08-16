const ORIGIN_KEY = "detailsOrigin";

// Enregistre la page courante quand on clique sur un lien Détails
export function initDetailsOrigin(origin) {
  document.addEventListener("click", (e) => {
    if (!e.target.classList.contains("action-details")) return;

    sessionStorage.setItem(ORIGIN_KEY, origin);
  });
}

// Récupère la page à ouvrir avec le bouton Retour
export function getDetailsOrigin(fallback = "character") {
  return sessionStorage.getItem(ORIGIN_KEY) || fallback;
}
