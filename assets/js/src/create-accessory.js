import { initReveal } from "../modules/animations.js";
import { initCustomSelects } from "../modules/forms.js";
import { sanitize } from "../modules/security.js";


// Gestion de l'upload de l'image
function initImageUpload() {
  const uploadBox = document.getElementById("uploadBox");
  const accessoryImageInput = document.getElementById("accessoryImage");
  const uploadPreview = document.getElementById("uploadPreview");
  const previewImage = document.getElementById("previewImage");

  if (!uploadBox || !accessoryImageInput || !uploadPreview || !previewImage) return;

  uploadBox.addEventListener("click", () => accessoryImageInput.click());
  previewImage.addEventListener("click", () => accessoryImageInput.click());

  accessoryImageInput.addEventListener("change", () => {
    const file = accessoryImageInput.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      previewImage.src = reader.result;

      uploadBox.classList.add("hidden");
      uploadPreview.classList.add("active");
      previewImage.classList.add("active");
    };

    reader.readAsDataURL(file);
  });
}


// Pour securité et validation du formulaire
function initCreateAccessoryValidation() {
  const createBtn = document.querySelector(".btn.btn-secondary");
  const nameInput = document.getElementById("name");
  const descInput = document.getElementById("description");
  const previewImage = document.getElementById("previewImage");
  const selects = document.querySelectorAll(".custom-select");

  if (!createBtn || !nameInput || !descInput || !previewImage) return;

  let touchedName = false;
  let touchedDescription = false;

  const nameField = nameInput.closest(".field");
  const nameError = document.createElement("p");
  nameError.classList.add("input-error", "input-error-character");
  nameField.insertAdjacentElement("afterend", nameError);

  const descField = descInput.closest(".field");
  const descError = document.createElement("p");
  descError.classList.add("input-error", "input-error-character");
  descField.insertAdjacentElement("afterend", descError);


  const showError = (el, msg, field) => {
    el.textContent = msg;
    el.style.opacity = "1";

    field.style.marginBottom = "0.4rem";
    el.style.marginBottom = "1rem";
  };

  const hideError = (el, field) => {
    el.textContent = "";
    el.style.opacity = "0";

    field.style.marginBottom = "1.3rem";
    el.style.marginBottom = "0rem";
  };

  const isImageUploaded = () =>
    previewImage.classList.contains("active") ||
    previewImage.src.startsWith("data:");

  const isSelectFilled = (select) => {
    const trigger = select.querySelector(".trigger-text");
    return trigger?.dataset?.value?.trim() !== "";
  };

  function validateName() {
    const sanitized = sanitize(nameInput.value);
    const length = sanitized.trim().length;

    if (!touchedName) return false;

    if (length === 0) {
      showError(nameError, "Veuillez entrer un nom", nameField);
      return false;
    }

    if (length < 3) {
      showError(nameError, "Le nom doit contenir au moins 3 caractères", nameField);
      return false;
    }

    hideError(nameError, nameField);
    return true;
  }

  function validateDescription() {
    const sanitized = sanitize(descInput.value);
    const length = sanitized.trim().length;

    if (!touchedDescription) return false;

    if (length === 0) {
      showError(descError, "Veuillez écrire une description", descField);
      return false;
    }

    if (length < 30) {
      showError(descError, "La description doit contenir au moins 30 caractères", descField);
      return false;
    }

    hideError(descError, descField);
    return true;
  }

  function validateAll() {
    let valid = true;

    if (!validateName()) valid = false;
    if (!validateDescription()) valid = false;
    if (!isImageUploaded()) valid = false;

    selects.forEach((select) => {
      if (!isSelectFilled(select)) valid = false;
    });

    if (valid) createBtn.classList.remove("state-disabled");
    else createBtn.classList.add("state-disabled");

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

  selects.forEach((select) => {
    select.addEventListener("click", () => {
      setTimeout(validateAll, 50);
    });
  });

  createBtn.classList.add("state-disabled");

  createBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    const container = document.querySelector(".feedback-zone");

    const success = document.createElement("p");
    success.textContent = "Votre accessoire a été créé avec succès !";
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


// Test
export function validateAccessoryForTest({ name, description, image, selects }) {
  const sanitizedName = name.trim();
  const sanitizedDesc = description.trim();

  const errors = {};

  if (sanitizedName.length === 0) {
    errors.name = "empty";
  } else if (sanitizedName.length < 3) {
    errors.name = "too_short";
  }

  if (sanitizedDesc.length === 0) {
    errors.description = "empty";
  } else if (sanitizedDesc.length < 30) {
    errors.description = "too_short";
  }

  if (!image) {
    errors.image = "missing";
  }

  if (!Array.isArray(selects) || selects.some(v => !v || v.trim() === "")) {
    errors.selects = "missing_value";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}


// Lance le JS de la page Create-accessory quand elle est chargée
if (typeof window !== "undefined") {
  initReveal();
  initImageUpload();
  initCustomSelects();
  initCreateAccessoryValidation();
}
