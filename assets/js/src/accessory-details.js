import { initReveal } from "../modules/animations.js";
import { initCustomSelects } from "../modules/forms.js";


// Récupère l'id de l'accessoire dans l'URL
function getAccessoryId() {
  return new URLSearchParams(window.location.search).get("id");
}


// Appels API
async function apiGetAccessory(id) {
  try {
    const res = await fetch("http://localhost:8080/api/accessories/" + id);
    if (!res.ok) return null;
    const data = await res.json();
    return data.accessory;
  } catch (e) {
    console.error("Erreur API get-accessory:", e);
    return null;
  }
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


// Affiche les informations de l'accessoire
function fillAccessory(accessory) {
  const previewImage = document.getElementById("previewImage");
  const uploadPreview = document.getElementById("uploadPreview");

  if (previewImage && accessory.image) {
    previewImage.src = accessory.image;
    uploadPreview?.classList.add("active");
  }

  setValue("#name", accessory.name);
  setValue("#description", accessory.description);

  setSelect("#Type", accessory.type);
  setSelect("#rarity", accessory.rarity);

  disableAllFields();
}

function setValue(selector, value) {
  const el = document.querySelector(selector);
  if (!el) return;
  el.value = value ?? "";
}

function setSelect(selector, value) {
  const select = document.querySelector(selector);
  if (!select || !value) return;

  const trigger = select.querySelector(".trigger-text");
  const option = select.querySelector(`.custom-option[data-value="${value}"]`);

  if (trigger && option) {
    trigger.innerHTML = option.innerHTML;
    trigger.dataset.value = value;
  }
}

function disableAllFields() {
  const inputs = document.querySelectorAll("input, textarea");
  inputs.forEach(i => {
    i.setAttribute("readonly", true);
    i.setAttribute("disabled", true);
  });

  const selects = document.querySelectorAll(".custom-select");
  selects.forEach(s => {
    s.classList.add("disabled");
    s.style.pointerEvents = "none";
  });
}


// Affiche un message dans la zone de feedback
function showMessage(text, type) {
  const container = document.querySelector(".feedback-zone");
  if (!container) return;

  const oldMsg = container.querySelector(".message");
  if (oldMsg) oldMsg.remove();

  const msg = document.createElement("p");
  msg.textContent = text;
  msg.classList.add("message", type);
  container.appendChild(msg);

  setTimeout(() => msg.classList.add("show"), 10);
}


// Charge l'accessoire demandé dans l'URL
async function initAccessoryDetails() {
  const id = getAccessoryId();

  if (!id) {
    disableAllFields();
    showMessage("Aucun accessoire sélectionné.", "error-message");
    return;
  }

  const accessory = await apiGetAccessory(id);

  if (!accessory) {
    disableAllFields();
    showMessage("Accessoire introuvable.", "error-message");
    return;
  }

  fillAccessory(accessory);
}


// Lance le JS de la page Accessory-details quand elle est chargée
async function start() {
  initReveal();
  await buildTypeOptions();
  await buildRarityOptions();
  initCustomSelects();
  initAccessoryDetails();
}

if (typeof window !== "undefined") start();
