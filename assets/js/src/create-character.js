import { initReveal } from "../modules/animations.js";
import { initCustomSelects } from "../modules/forms.js";


// Gestion de l'upload de l'image 
function initImageUpload() {
  const uploadBox = document.getElementById("uploadBox");
  const heroImageInput = document.getElementById("heroImage");
  const uploadPreview = document.getElementById("uploadPreview");
  const previewImage = document.getElementById("previewImage");

  if (!uploadBox || !heroImageInput || !uploadPreview || !previewImage) return;

  uploadBox.addEventListener("click", () => {
    heroImageInput.click();
  });

  previewImage.addEventListener("click", () => {
    heroImageInput.click();
  });

  heroImageInput.addEventListener("change", () => {
    const file = heroImageInput.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      previewImage.src = reader.result;

      uploadBox.classList.add("hidden");
      uploadPreview.classList.add("active");
    };

    reader.readAsDataURL(file);
  });
}


// Statut du personnage et accès aux accessoires (Données fictives // Besoin API)
function initEquipStatus() {
  const container = document.querySelector(".equip-content");
  const accessoiresCard = document.querySelector(".form-card.accessoires");

  if (!container || !accessoiresCard) return;

  const fakeCharacterStatus = "valid";

  let html = "";

  switch (fakeCharacterStatus) {

    case "draft":
      html = `
        <div class="equip-status-header">
          <h3 class="sub-title">Statut</h3>
          <span class="status status-to-validate">Faire valider</span>
        </div>

        <div class="equip-info equip-info-secondary">
          <p>Votre personnage doit être validé par un employé avant d'accéder aux accessoires.</p>
        </div>
      `;

      accessoiresCard.classList.add("disabled");
      break;

    case "pending":
      html = `
        <div class="equip-status-header">
          <h3 class="sub-title">Statut</h3>
          <span class="status status-pending">En attente de validation</span>
        </div>

        <div class="equip-info equip-info-warning">
          <p>Votre personnage doit être validé par un employé avant d'accéder aux accessoires.</p>
        </div>
      `;

      accessoiresCard.classList.add("disabled");
      break;

    case "valid":
      html = `
        <div class="equip-status-header">
          <h3 class="sub-title">Statut</h3>
          <span class="status status-valid">Validé</span>
        </div>

        <div class="equip-info equip-info-success">
          <p>Votre personnage a été validé par un employé et peut maintenant accéder à tous les accessoires.</p>
        </div>
      `;

      accessoiresCard.classList.remove("disabled");
      break;

    case "refused":
      html = `
        <div class="equip-status-header">
          <h3 class="sub-title">Statut</h3>
          <span class="status status-refused">Refusé</span>
        </div>

        <div class="equip-info equip-info-danger">
          <p>Votre personnage a été refusé par un employé et nécessite des corrections avant une nouvelle validation.</p>
        </div>
      `;

      accessoiresCard.classList.add("disabled");
      break;
  }

  container.innerHTML = html;
}


// Lance le JS de la page Création de personnage quand elle est chargée
if (typeof window !== "undefined") {
  initReveal();
  initImageUpload();
  initCustomSelects();
  initEquipStatus();
}