import { initReveal } from "../modules/animations.js";
import { initCustomSelects } from "../modules/forms.js";
import { sanitize } from "../modules/security.js";
import { initBackReload } from "../modules/back-reload.js";


// Appel API
async function apiGetCharacter(id) {
  try {
    const res = await fetch("http://localhost:8080/api/characters/" + id);
    if (!res.ok) return null;
    const data = await res.json();
    return data.character;
  } catch (e) {
    console.error("Erreur API get-character:", e);
    return null;
  }
}


// Gestion de l'upload de l'image
function initImageUpload() {
  const uploadBox = document.getElementById("uploadBox");
  const heroImageInput = document.getElementById("heroImage");
  const uploadPreview = document.getElementById("uploadPreview");
  const previewImage = document.getElementById("previewImage");

  if (!uploadBox || !heroImageInput || !uploadPreview || !previewImage) return;

  uploadBox.addEventListener("click", () => heroImageInput.click());
  previewImage.addEventListener("click", () => heroImageInput.click());

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


// Statut du personnage et accès aux accessoires
function initEquipStatus(status) {
  const container = document.querySelector(".equip-content");
  const accessoiresCard = document.querySelector(".form-section.accessoires");

  if (!container || !accessoiresCard) return;

  let html = "";

  switch (status) {
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
          <p>Votre personnage a été validé et peut maintenant accéder à tous les accessoires.</p>
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
          <p>Votre personnage a été refusé et nécessite des corrections avant une nouvelle validation.</p>
        </div>
      `;
      accessoiresCard.classList.add("disabled");
      break;
  }

  container.innerHTML = html;
}


// Lecture / écriture d'un select personnalisé
function getSelectValue(id) {
  return document.querySelector("#" + id + " .trigger-text")?.dataset.value || "";
}

function setSelectValue(id, value) {
  const select = document.getElementById(id);
  if (!select || !value) return;

  const trigger = select.querySelector(".trigger-text");
  const option = select.querySelector(".custom-option[data-value='" + value + "']");

  if (trigger && option) {
    trigger.innerHTML = option.innerHTML;
    trigger.dataset.value = value;
  }
}


// Gestion du formulaire du personnage
async function initCharacterForm() {
  const editId = new URLSearchParams(window.location.search).get("id");
  const character = editId ? await apiGetCharacter(editId) : null;
  const isEdit = character !== null;

  initEquipStatus(isEdit ? character.status : "draft");

  const createBtn = document.querySelector(".btn.btn-secondary");
  const nameInput = document.getElementById("name");
  const descInput = document.getElementById("description");
  const previewImage = document.getElementById("previewImage");
  const selects = document.querySelectorAll(".custom-select");
  const container = document.querySelector(".feedback-zone");

  if (!createBtn || !nameInput || !descInput || !previewImage) return;

  let touched = {
    name: false,
    description: false
  };

  const nameField = nameInput.closest(".field");
  const nameError = document.createElement("p");
  nameError.classList.add("input-error", "input-error-character");
  nameField.appendChild(nameError);

  const descField = descInput.closest(".field");
  const descError = document.createElement("p");
  descError.classList.add("input-error", "input-error-character");
  descField.appendChild(descError);

  function showError(errorEl, msg, field) {
    errorEl.textContent = msg;
    errorEl.style.opacity = "1";
    field.style.marginBottom = "0.4rem";
    errorEl.style.marginBottom = "1rem";
  }

  function hideError(errorEl, field) {
    errorEl.textContent = "";
    errorEl.style.opacity = "0";
    field.style.marginBottom = "1.3rem";
    errorEl.style.marginBottom = "0rem";
  }

  function showMessage(text, type) {
    const oldMsg = container.querySelector(".message");
    if (oldMsg) oldMsg.remove();

    const msg = document.createElement("p");
    msg.textContent = text;
    msg.classList.add("message", type);
    container.appendChild(msg);

    setTimeout(() => msg.classList.add("show"), 10);
  }

  function isImageUploaded() {
    return previewImage.classList.contains("active") || previewImage.src.startsWith("data:");
  }

  function isSelectFilled(select) {
    return select.querySelector(".trigger-text")?.dataset?.value?.trim() !== "";
  }

  function validateForm() {
    const name = sanitize(nameInput.value).trim();
    const description = sanitize(descInput.value).trim();

    let valid = true;

    if (touched.name) {
      if (name.length === 0) {
        showError(nameError, "Veuillez entrer un nom", nameField);
        valid = false;
      } else if (name.length < 3 || name.length > 9) {
        showError(nameError, "Le nom doit contenir entre 3 et 9 caractères", nameField);
        valid = false;
      } else {
        hideError(nameError, nameField);
      }
    }

    if (touched.description) {
      if (description.length === 0) {
        showError(descError, "Veuillez écrire une description", descField);
        valid = false;
      } else if (description.length < 30) {
        showError(descError, "La description doit contenir au moins 30 caractères", descField);
        valid = false;
      } else {
        hideError(descError, descField);
      }
    }

    if (!isImageUploaded()) valid = false;

    let allSelectsFilled = true;
    selects.forEach((select) => {
      if (!isSelectFilled(select)) {
        valid = false;
        allSelectsFilled = false;
      }
    });

    if (name.length >= 3 && name.length <= 9 && description.length >= 30 && isImageUploaded() && allSelectsFilled) {
      createBtn.classList.remove("state-disabled");
    } else {
      createBtn.classList.add("state-disabled");
    }

    return valid;
  }

  function markTouched(field) {
    touched[field] = true;
    validateForm();
  }

  nameInput.addEventListener("input", () => markTouched("name"));
  descInput.addEventListener("input", () => markTouched("description"));
  document.getElementById("heroImage")?.addEventListener("change", validateForm);
  selects.forEach((select) => select.addEventListener("click", () => setTimeout(validateForm, 50)));

  validateForm();

  if (isEdit) {
    nameInput.value = character.name || "";
    descInput.value = character.description || "";

    if (character.image) {
      previewImage.src = character.image;
      document.getElementById("uploadBox")?.classList.add("hidden");
      document.getElementById("uploadPreview")?.classList.add("active");
    }

    setSelectValue("gender", character.type);

    const app = character.appearance || {};
    ["hairColor", "eyeColor", "skinColor", "mouthShape", "eyeShape", "noseShape"].forEach((k) => setSelectValue(k, app[k]));

    setSelectValue("armor", character.armor);
    setSelectValue("weapon", character.weapon);
    setSelectValue("relique", character.relique);

    touched.name = true;
    touched.description = true;
    validateForm();
  }

  createBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      showMessage("Vous devez être connecté.", "error-message");
      return;
    }

    const payload = {
      name: sanitize(nameInput.value),
      type: getSelectValue("gender"),
      description: sanitize(descInput.value),
      image: previewImage.src,
      appearance: {
        hairColor: getSelectValue("hairColor"),
        eyeColor: getSelectValue("eyeColor"),
        skinColor: getSelectValue("skinColor"),
        mouthShape: getSelectValue("mouthShape"),
        eyeShape: getSelectValue("eyeShape"),
        noseShape: getSelectValue("noseShape")
      }
    };

    if (isEdit && character.status === "valid") {
      payload.armor = getSelectValue("armor");
      payload.weapon = getSelectValue("weapon");
      payload.relique = getSelectValue("relique");
    }

    const url = isEdit
      ? "http://localhost:8080/api/characters/" + character.id
      : "http://localhost:8080/api/characters";

    const res = await fetch(url, {
      method: isEdit ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      showMessage(data.message || "Une erreur est survenue.", "error-message");
      return;
    }

    showMessage(isEdit ? "Personnage mis à jour !" : "Votre personnage a été créé avec succès !", "success-message");

    createBtn.classList.add("state-disabled");
    createBtn.setAttribute("disabled", "true");

    setTimeout(() => {
      window.location.href = "/my-space";
    }, 1000);
  });
}


// Lance le js de la page Create-character quand elle est chargée
if (typeof window !== "undefined") {
  initReveal();
  initImageUpload();
  initCustomSelects();
  initBackReload();
  initCharacterForm();
}
