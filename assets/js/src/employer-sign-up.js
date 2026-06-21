import { initReveal } from "../modules/animations.js";
import { sanitize, isValidEmail, isValidPassword, isEmailUnique } from "../modules/security.js";
import { initBackReload } from "../modules/back-reload.js";


// Gestion du formulaire de création d'un compte employeur (Données fictives // Besoin API)
const existingEmployers = [
  { email: "entreprise@mail.com" },
  { email: "contact@studio.com" }
];


function initEmployerSignUpForm() {
  const form = document.querySelector(".auth-form-container");
  if (!form) return;

  const emailInput = document.querySelector("#email");
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
  const passwordError = createErrorElement(passwordInput);
  const password2Error = createErrorElement(password2Input);

  let touched = {
    email: false,
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
    const password = sanitize(passwordInput.value);
    const password2 = sanitize(password2Input.value);

    let valid = true;

    if (touched.email) {
      if (!isValidEmail(email)) {
        showError(emailError, "Email invalide");
        valid = false;

      } else if (!isEmailUnique(email, existingEmployers)) {
        showError(emailError, "Cet email est déjà utilisé");
        valid = false;

      } else {
        hideError(emailError);
      }
    }

    if (touched.password) {
      if (!isValidPassword(password)) {
        showError(passwordError, "Mot de passe non conforme (8 caractères, maj, min, chiffre, spécial)");
        valid = false;
      } else {
        hideError(passwordError);
      }
    }

    // CONFIRMATION
    if (touched.password2) {
      if (password !== password2) {
        showError(password2Error, "La confirmation n'est pas identique");
        valid = false;
      } else {
        hideError(password2Error);
      }
    }

    // Activation du bouton
    if (
      isValidEmail(email) &&
      isEmailUnique(email, existingEmployers) &&
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
  passwordInput.addEventListener("input", () => markTouched("password"));
  password2Input.addEventListener("input", () => markTouched("password2"));

  validateForm();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const success = document.createElement("p");
    success.textContent = "Compte employeur créé avec succès !";
    success.classList.add("message", "success-message");
    form.appendChild(success);

    submitBtn.classList.add("btn-disabled");
    submitBtn.setAttribute("disabled", "true");

    setTimeout(() => success.classList.add("show"), 10);

    localStorage.setItem("employerLogged", "true");

    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
  });
}

// Lance le js de la page Employer-sign-up quand elle est chargée
if (typeof window !== "undefined") {
  initReveal();
  initEmployerSignUpForm();
  initBackReload();
}
