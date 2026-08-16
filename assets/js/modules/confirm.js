let confirmPopup = null;

// Déplace le modal dans le body pour qu'il s'affiche par-dessus tout
export function initConfirmModal() {
  confirmPopup = document.getElementById("confirm-popup");
  if (confirmPopup) document.body.appendChild(confirmPopup);
}

// Ouvre le modal et résout true si l'utilisateur confirme la suppression
export function askConfirmDelete(title) {
  return new Promise((resolve) => {
    if (!confirmPopup) return resolve(false);

    const acceptBtn = confirmPopup.querySelector("#confirm-accept");
    const cancelBtn = confirmPopup.querySelector("#confirm-cancel");
    const closeBtn = confirmPopup.querySelector(".popup-close");
    const titleEl = confirmPopup.querySelector(".popup-title");

    if (title && titleEl) titleEl.textContent = title;

    confirmPopup.style.display = "flex";
    document.body.style.overflow = "hidden";

    function cleanup() {
      confirmPopup.style.display = "none";
      document.body.style.overflow = "";
      acceptBtn.removeEventListener("click", onAccept);
      cancelBtn.removeEventListener("click", onCancel);
      closeBtn.removeEventListener("click", onCancel);
    }

    function onAccept() {
      cleanup();
      resolve(true);
    }

    function onCancel() {
      cleanup();
      resolve(false);
    }

    acceptBtn.addEventListener("click", onAccept);
    cancelBtn.addEventListener("click", onCancel);
    closeBtn.addEventListener("click", onCancel);
  });
}
