import { initReveal } from "../modules/animations.js";
import { initCustomSelects } from "../modules/forms.js";


// Infomation sur l'accessoire (Données fictives // Besoin API)
function initAccessoryData() {
  const fakeData = {
    image: "/assets/images/accessory-details/Arc-lunaire.webp",
    name: "Arc lunaire",
    type: "weapon",
    rarity: "rare",
    description: "Arc forgé dans un métal sombre, illuminé par une lueur cyan. Sa forme évoque un croissant de lune chargé d'énergie éthérée."
  };

  const previewImage = document.getElementById("previewImage");
  const uploadPreview = document.getElementById("uploadPreview");

  if (previewImage) {
    previewImage.src = fakeData.image;
    uploadPreview?.classList.add("active");
  }

  setValue("#name", fakeData.name);
  setValue("#description", fakeData.description);

  setSelect("#Type", fakeData.type);
  setSelect("#rarity", fakeData.rarity);

  disableAllFields();
}

function setValue(selector, value) {
  const el = document.querySelector(selector);
  if (!el) return;
  el.value = value;
}

function setSelect(selector, value) {
  const select = document.querySelector(selector);
  if (!select) return;

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


// Lance le JS de la page Accessory-details quand elle est chargée
if (typeof window !== "undefined") {
  initReveal();
  initCustomSelects();
  initAccessoryData();
}
