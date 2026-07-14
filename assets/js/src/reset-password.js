import { initReveal } from "../modules/animations.js";
import { sanitize, isValidEmail, isValidPassword } from "../modules/security.js";
import { initBackReload } from "../modules/back-reload.js";


// Gestion du formulaire pour changé de mot de passe
function initResetPasswordForm() {
  const form = document.querySelector(".auth-form-container");
  if (!form) return;

  const emailInput = document.querySelector("#email");
  const tempPasswordInput = document.querySelector("#temp-password");
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
  const tempPasswordError = createErrorElement(tempPasswordInput);
  const passwordError = createErrorElement(passwordInput);
  const password2Error = createErrorElement(password2Input);

  let touched = {
    email: false,
    tempPassword: false,
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
    const tempPassword = sanitize(tempPasswordInput.value);
    const password = sanitize(passwordInput.value);
    const password2 = sanitize(password2Input.value);

    let valid = true;

    if (touched.email) {
      if (!isValidEmail(email)) {
        showError(emailError, "Email invalide");
        valid = false;
      } else hideError(emailError);
    }

    if (touched.tempPassword) {
      if (tempPassword.length < 1) {
        showError(tempPasswordError, "Veuillez entrer votre mot de passe temporaire");
        valid = false;
      } else hideError(tempPasswordError);
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
      tempPassword.length > 0 &&
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
  tempPasswordInput.addEventListener("input", () => markTouched("tempPassword"));
  passwordInput.addEventListener("input", () => markTouched("password"));
  password2Input.addEventListener("input", () => markTouched("password2"));

  validateForm();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const email = sanitize(emailInput.value);
    const temporaryPassword = sanitize(tempPasswordInput.value);
    const newPassword = sanitize(passwordInput.value);

    const oldMsg = form.querySelector(".message");
    if (oldMsg) oldMsg.remove();

    try {
      const response = await fetch("http://localhost:8080/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          temporaryPassword,
          newPassword
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const error = document.createElement("p");
        error.textContent = data.message || "Une erreur est survenue lors du changement de mot de passe.";
        error.classList.add("message", "error-message");
        form.appendChild(error);

        setTimeout(() => error.classList.add("show"), 10);
        return;
      }

      const success = document.createElement("p");
      success.textContent = "Votre mot de passe a été modifié avec succès !";
      success.classList.add("message", "success-message");
      form.appendChild(success);

      submitBtn.classList.add("btn-disabled");
      submitBtn.setAttribute("disabled", "true");

      setTimeout(() => success.classList.add("show"), 10);

      setTimeout(() => {
        window.location.href = "/sign-in";
      }, 1000);
    } catch {
      const error = document.createElement("p");
      error.textContent = "Erreur réseau. Veuillez réessayer.";
      error.classList.add("message", "error-message");
      form.appendChild(error);

      setTimeout(() => error.classList.add("show"), 10);
    }
  });
}


// Lance le JS de la page Reset-password quand elle est chargée
if (typeof window !== "undefined") {
  initReveal();
  initResetPasswordForm();
  initBackReload();
}
