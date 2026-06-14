import { initReveal } from "../modules/animations.js";
import { sanitize, isValidEmail, isValidPseudo, isValidPassword, isEmailUnique } from "../modules/security.js";
import { initBackReload } from "../modules/back-reload.js";


// Gestion du formulaire d'inscription (Données fictives // Besoin API)
const existingUsers = [
  { email: "test@mail.com", pseudo: "PlayerOne" },
  { email: "jasmine@mail.com", pseudo: "Jasmine" }
];

function isPseudoUnique(pseudo) {
  return !existingUsers.some(u => u.pseudo.toLowerCase() === pseudo.toLowerCase());
}

function initSignUpForm() {
  const form = document.querySelector(".auth-form-container");
  if (!form) return;

  const emailInput = document.querySelector("#email");
  const pseudoInput = document.querySelector("#pseudo");
  const passwordInput = document.querySelector("#password");
  const password2Input = document.querySelector("#password2");
  const submitBtn = document.querySelector(".btn.btn-secondary");

  function createErrorElement(input) {
    const error = document.createElement("p");
    error.classList.add("input-error");
    input.insertAdjacentElement("afterend", error);
    return error;
  }

  const emailError = createErrorElement(emailInput);
  const pseudoError = createErrorElement(pseudoInput);
  const passwordError = createErrorElement(passwordInput);
  const password2Error = createErrorElement(password2Input);

  let touched = {
    email: false,
    pseudo: false,
    password: false,
    password2: false
  };

  function showError(errorEl, msg) {
    errorEl.textContent = msg;
    errorEl.style.opacity = "1";
  }

  function hideError(errorEl) {
    errorEl.textContent = "";
    errorEl.style.opacity = "0";
  }

  function validateForm() {
    const email = sanitize(emailInput.value);
    const pseudo = sanitize(pseudoInput.value);
    const password = sanitize(passwordInput.value);
    const password2 = sanitize(password2Input.value);

    let valid = true;

    if (touched.email) {
      if (!isValidEmail(email)) {
        showError(emailError, "Email invalide");
        valid = false;

      } else if (!isEmailUnique(email, existingUsers)) {
        showError(emailError, "Cet email est déjà utilisé");
        valid = false;

      } else {
        hideError(emailError);
      }
    }

    if (touched.pseudo) {
      if (!isValidPseudo(pseudo)) {
        showError(pseudoError, "3 à 20 caractères (lettres, chiffres, _ -)");
        valid = false;

      } else if (!isPseudoUnique(pseudo)) {
        showError(pseudoError, "Ce pseudo est déjà utilisé");
        valid = false;

      } else {
        hideError(pseudoError);
      }
    }

    if (touched.password) {
      if (!isValidPassword(password)) {
        showError(passwordError, "Mot de passe non conforme (8 caractères dont une majuscule, une minuscule, un chiffre et un spécial)");
        valid = false;

      } else {
        hideError(passwordError);
      }
    }

    if (touched.password2) {
      if (password !== password2) {
        showError(password2Error, "La confirmation n'est pas identique au mot de passe");
        valid = false;

      } else {
        hideError(password2Error);
      }
    }

    if (
      isValidEmail(email) &&
      isEmailUnique(email, existingUsers) &&
      isValidPseudo(pseudo) &&
      isPseudoUnique(pseudo) &&
      isValidPassword(password) &&
      password === password2
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
  passwordInput.addEventListener("input", () => markTouched("password"));
  password2Input.addEventListener("input", () => markTouched("password2"));

  validateForm();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const success = document.createElement("p");
    success.textContent = "Votre compte a été créé avec succès !";
    success.classList.add("message", "success-message");
    form.appendChild(success);

    submitBtn.classList.add("btn-disabled");
    submitBtn.setAttribute("disabled", "true");

    setTimeout(() => success.classList.add("show"), 10);

    localStorage.setItem("userLogged", "true");

    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
  });
}


// Lance le js de la page Sign-up quand elle est chargée
if (typeof window !== "undefined") {
  initReveal();
  initSignUpForm();
  initBackReload();
}