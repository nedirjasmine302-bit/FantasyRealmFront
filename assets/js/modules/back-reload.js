// Reload la page si retour arrière
export function initBackReload() {
  window.addEventListener("pageshow", (event) => {
    const nav = performance.getEntriesByType("navigation")[0];

    if (event.persisted || nav.type === "back_forward") {
      window.location.reload();
    }
  });
}
