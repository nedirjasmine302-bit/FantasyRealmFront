import { initReveal } from "../modules/animations.js";
import { initCustomSelects } from "../modules/forms.js";
import { sanitize } from "../modules/security.js";


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
  const accessoiresCard = document.querySelector(".form-section.accessoires");

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


// Pour securité et validation du formulaire
function initCreateCharacterValidation() {
  const createBtn = document.querySelector(".btn.btn-secondary");
  const nameInput = document.getElementById("name");
  const descInput = document.getElementById("description");
  const previewImage = document.getElementById("previewImage");
  const selects = document.querySelectorAll(".custom-select");

  if (!createBtn || !nameInput || !descInput || !previewImage) return;

  let touchedDescription = false;
  let touchedName = false;

  const nameError = document.createElement("p");
  nameError.classList.add("input-error", "input-error-character");
  nameInput.insertAdjacentElement("afterend", nameError);

  const descError = document.createElement("p");
  descError.classList.add("input-error", "input-error-character");
  descInput.insertAdjacentElement("afterend", descError);

  function showError(el, msg) {
    el.textContent = msg;
    el.style.opacity = "1";
  }

  function hideError(el) {
    el.textContent = "";
    el.style.opacity = "0";
  }

  function isImageUploaded() {
    return previewImage.classList.contains("active") || previewImage.src.startsWith("data:");
  }

  function isSelectFilled(select) {
    const trigger = select.querySelector(".trigger-text");
    return trigger?.dataset?.value?.trim() !== "";
  }

  function validateName() {
    const sanitized = sanitize(nameInput.value);

    if (!touchedName) return true;

    if (sanitized.trim() === "") {
      showError(nameError, "Veuillez entrer un nom");
      return false;
    }

    hideError(nameError);
    return true;
  }

  function validateDescription() {
    const sanitized = sanitize(descInput.value);

    if (!touchedDescription) return true;

    if (sanitized.trim() === "") {
      showError(descError, "Veuillez écrire une description");
      return false;
    }

    hideError(descError);
    return true;
  }

  function validateAll() {
    let valid = true;

    if (!validateName()) valid = false;
    if (!validateDescription()) valid = false;
    if (!isImageUploaded()) valid = false;

    selects.forEach(select => {
      if (!isSelectFilled(select)) valid = false;
    });

    if (valid) {
      createBtn.classList.remove("state-disabled");
    } else {
      createBtn.classList.add("state-disabled");
    }

    return valid;
  }

  nameInput.addEventListener("input", () => {
    touchedName = true;
    validateAll();
  });

  descInput.addEventListener("input", () => {
    touchedDescription = true;
    validateAll();
  });

  document.getElementById("heroImage")?.addEventListener("change", validateAll);

  selects.forEach(select => {
    select.addEventListener("click", () => {
      setTimeout(validateAll, 50);
    });
  });

  createBtn.classList.add("state-disabled");

  createBtn.addEventListener("click", (e) => {
    e.preventDefault();

    if (!validateAll()) return;
    if (createBtn.classList.contains("state-disabled")) return;

    const container = document.querySelector(".feedback-zone");

    const success = document.createElement("p");
    success.textContent = "Votre personnage a été créé avec succès !";
    success.classList.add("message", "success-message");
    container.appendChild(success);

    createBtn.classList.add("state-disabled");
    createBtn.setAttribute("disabled", "true");

    setTimeout(() => success.classList.add("show"), 10);

    setTimeout(() => {
      window.location.href = "/my-space";
    }, 1000);
  });
}


// Lance le JS de la page Création de personnage quand elle est chargée
if (typeof window !== "undefined") {
  initReveal();
  initImageUpload();
  initCustomSelects();
  initEquipStatus();
  initCreateCharacterValidation();
}