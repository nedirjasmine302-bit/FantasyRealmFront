import { initReveal } from "../modules/animations.js";
import { sanitize, isValidEmail, isValidPseudo } from "../modules/security.js";


// Gestion utilisateur + sécurité front (Données fictives // Besoin API)
const user = {
  isLoggedIn: true,
  email: "jasmine@mail.com",
  pseudo: "Jasmine"
};

function initContactForm() {
  const form = document.querySelector(".contact-form-card");
  if (!form) return;

  const emailInput = document.querySelector("#email");
  const pseudoInput = document.querySelector("#pseudo");
  const messageInput = document.querySelector("#message");
  const submitBtn = document.querySelector(".btn.btn-secondary");

  function createErrorElement(input) {
    const error = document.createElement("p");
    error.classList.add("input-error");
    input.insertAdjacentElement("afterend", error);
    return error;
  }

  const emailError = createErrorElement(emailInput);
  const pseudoError = createErrorElement(pseudoInput);
  const messageError = createErrorElement(messageInput);

  if (user.isLoggedIn) {
    emailInput.value = user.email;
    pseudoInput.value = user.pseudo;
    pseudoInput.disabled = true;
  }

  let touched = {
    email: false,
    pseudo: false,
    message: false
  };

  function showError(el, msg) {
    el.textContent = msg;
    el.style.opacity = "1";
  }

  function hideError(el) {
    el.textContent = "";
    el.style.opacity = "0";
  }

  function validateForm() {
    const email = sanitize(emailInput.value);
    const pseudo = sanitize(pseudoInput.value);
    const message = sanitize(messageInput.value);

    let valid = true;

    if (touched.email) {
      if (!isValidEmail(email)) {
        showError(emailError, "Email invalide");
        valid = false;
      } else hideError(emailError);
    }

    if (touched.pseudo) {
      if (!isValidPseudo(pseudo)) {
        showError(pseudoError, "3 à 20 caractères (lettres, chiffres, _ -)");
        valid = false;
      } else hideError(pseudoError);
    }

    if (touched.message) {
      if (message.trim() === "") {
        showError(messageError, "Veuillez entrer un message");
        valid = false;
      } else hideError(messageError);
    }

    if (
      (user.isLoggedIn || isValidEmail(email)) &&
      isValidPseudo(pseudo) &&
      message.trim() !== ""
    ) {
      submitBtn.classList.remove("btn-disabled");
    } else {
      submitBtn.classList.add("btn-disabled");
    }

    return valid;
  }

  function markTouched(field) {
    touched[field] = true;
    validateForm();
  }

  emailInput.addEventListener("input", () => markTouched("email"));
  pseudoInput.addEventListener("input", () => markTouched("pseudo"));
  messageInput.addEventListener("input", () => markTouched("message"));

  validateForm();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const success = document.createElement("p");
    success.textContent = "Message envoyé avec succès !";
    success.classList.add("message", "success-message");
    form.appendChild(success);

    setTimeout(() => {
      success.classList.add("show");
    }, 10);


    if (!user.isLoggedIn) {
      emailInput.value = "";
      pseudoInput.value = "";
    }
    messageInput.value = "";

    touched = { email: false, pseudo: false, message: false };
    validateForm();

    setTimeout(() => {
      window.location.reload();
    }, 1000);
  });
}


// Test pour la fonction d'autocomplétion
export function getContactFormState(user) {
  if (user.isLoggedIn) {
    return {
      email: user.email,
      pseudo: user.pseudo,
      pseudoDisabled: true,
      pseudoPlaceholder: "Votre pseudo"
    };
  }

  return {
    email: "",
    pseudo: "",
    pseudoDisabled: false,
    pseudoPlaceholder: "Votre pseudo (optionnel)"
  };
}


// Lance le JS de la page Contact de personnage quand elle est chargée
if (typeof window !== "undefined") {
  initReveal();
  initContactForm();
}