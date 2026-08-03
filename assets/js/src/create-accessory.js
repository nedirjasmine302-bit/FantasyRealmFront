import { initReveal } from "../modules/animations.js";
import { initCustomSelects } from "../modules/forms.js";
import { sanitize } from "../modules/security.js";


// Appels API
async function apiGetMe(token) {
  try {
    const res = await fetch("http://localhost:8080/api/me", {
      headers: { "Authorization": "Bearer " + token }
    });
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    console.error("Erreur API me:", e);
    return null;
  }
}

// Vérifie que l'utilisateur connecté est employé ou admin
async function isEmployerOrAdmin(token) {
  const me = await apiGetMe(token);
  const roles = me?.roles || [];
  return roles.includes("ROLE_EMPLOYER") || roles.includes("ROLE_ADMIN");
}

async function apiGetAccessoryTypes() {
  try {
    const res = await fetch("http://localhost:8080/api/accessory-types");
    if (!res.ok) return [];
    const data = await res.json();
    return data.types || [];
  } catch (e) {
    console.error("Erreur API accessory-types:", e);
    return [];
  }
}

async function apiGetRarities() {
  try {
    const res = await fetch("http://localhost:8080/api/rarities");
    if (!res.ok) return [];
    const data = await res.json();
    return data.rarities || [];
  } catch (e) {
    console.error("Erreur API rarities:", e);
    return [];
  }
}

async function apiCreateAccessory(payload, token) {
  const res = await fetch("http://localhost:8080/api/accessories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify(payload)
  });

  return res.json();
}


// Lecture de la valeur d'un select personnalisé
function getSelectValue(id) {
  return document.querySelector("#" + id + " .trigger-text")?.dataset.value || "";
}


// Récupère les types d'accessoires et construit les options du select
async function buildTypeOptions() {
  const optionsBox = document.querySelector("#Type .custom-options");
  if (!optionsBox) return;

  const types = await apiGetAccessoryTypes();

  optionsBox.innerHTML = types
    .map(t => `<div class="custom-option" data-value="${t.value}">${t.label}</div>`)
    .join("");
}


// Récupère les raretés et construit les options du select
async function buildRarityOptions() {
  const optionsBox = document.querySelector("#rarity .custom-options");
  if (!optionsBox) return;

  const rarities = await apiGetRarities();

  optionsBox.innerHTML = rarities
    .map(r => `<span class="custom-option" data-value="${r.value}" data-rarity="${r.value}"><span class="dot dot-${r.value}"></span> ${r.label}</span>`)
    .join("");
}


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

    if (length < 3 || length > 20) {
      showError(nameError, "Le nom doit contenir entre 3 et 20 caractères", nameField);
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

  createBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    const container = document.querySelector(".feedback-zone");

    function showMessage(text, type) {
      const oldMsg = container.querySelector(".message");
      if (oldMsg) oldMsg.remove();

      const msg = document.createElement("p");
      msg.textContent = text;
      msg.classList.add("message", type);
      container.appendChild(msg);

      setTimeout(() => msg.classList.add("show"), 10);
    }

    const token = localStorage.getItem("token");
    if (!token) {
      showMessage("Vous devez être connecté.", "error-message");
      return;
    }

    if (!(await isEmployerOrAdmin(token))) {
      showMessage("Accès interdit : cette page est réservée aux employés.", "error-message");
      return;
    }

    const payload = {
      name: sanitize(nameInput.value),
      type: getSelectValue("Type"),
      rarity: getSelectValue("rarity"),
      description: sanitize(descInput.value),
      image: previewImage.src
    };

    const data = await apiCreateAccessory(payload, token);

    if (!data.success) {
      showMessage(data.message || "Une erreur est survenue.", "error-message");
      return;
    }

    showMessage("Votre accessoire a été créé avec succès !", "success-message");

    createBtn.classList.add("state-disabled");
    createBtn.setAttribute("disabled", "true");

    setTimeout(() => {
      window.location.href = "/management#accessories";
    }, 1000);
  });
}


// Charge les types puis initialise les selects et la validation
async function initCreateAccessory() {
  await buildTypeOptions();
  await buildRarityOptions();
  initCustomSelects();
  initCreateAccessoryValidation();
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
  } else if (sanitizedName.length > 20) {
    errors.name = "too_long";
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
  initCreateAccessory();
}
