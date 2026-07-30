import { initReveal } from "../modules/animations.js";
import { sanitize, isValidEmail, isValidPassword } from "../modules/security.js";
import { initBackReload } from "../modules/back-reload.js";


// Gestion du formulaire de réinitialisation du mot de passe employé
function initResetEmployerPasswordForm() {
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
    const password = sanitize(passwordInput.value);
    const password2 = sanitize(password2Input.value);

    let valid = true;

    if (touched.email) {
      if (!isValidEmail(email)) {
        showError(emailError, "Email invalide");
        valid = false;
      } else hideError(emailError);
    }

    if (touched.password) {
      if (!isValidPassword(password)) {
        showError(passwordError, "Mot de passe non conforme (8 caractères dont majuscule, minuscule, chiffre et spécial)");
        valid = false;
      } else hideError(passwordError);
    }

    if (touched.password2) {
      if (password !== password2) {
        showError(password2Error, "La confirmation n'est pas identique");
        valid = false;
      } else hideError(password2Error);
    }

    if (
      isValidEmail(email) &&
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

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const email = sanitize(emailInput.value);
    const newPassword = sanitize(passwordInput.value);

    const oldMsg = form.querySelector(".message");
    if (oldMsg) oldMsg.remove();

    try {
      const response = await fetch("http://localhost:8080/api/auth/reset-employer-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          newPassword
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const error = document.createElement("p");
        error.textContent = data.message || "Une erreur est survenue lors de la réinitialisation.";
        error.classList.add("message", "error-message");
        form.appendChild(error);

        setTimeout(() => error.classList.add("show"), 10);
        return;
      }

      const success = document.createElement("p");
      success.textContent = data.message || "Le mot de passe de l'employé a été réinitialisé avec succès.";
      success.classList.add("message", "success-message");
      form.appendChild(success);

      submitBtn.classList.add("btn-disabled");
      submitBtn.setAttribute("disabled", "true");

      setTimeout(() => success.classList.add("show"), 10);

      setTimeout(() => {
        window.location.href = "/management#employees";
      }, 1500);
    } catch {
      const error = document.createElement("p");
      error.textContent = "Erreur réseau. Veuillez réessayer.";
      error.classList.add("message", "error-message");
      form.appendChild(error);

      setTimeout(() => error.classList.add("show"), 10);
    }
  });
}


// Lance le JS de la page Reset-employer-password quand elle est chargée
if (typeof window !== "undefined") {
  initReveal();
  initResetEmployerPasswordForm();
  initBackReload();
}
