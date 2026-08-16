import { API_BASE } from "../modules/config.js";
import { initReveal } from "../modules/animations.js";
import { sanitize, isValidEmail, isValidPseudo } from "../modules/security.js";
import { initBackReload } from "../modules/back-reload.js";
import { saveRateLimit, getRateLimitRemaining, clearRateLimit } from "../modules/rate-limit.js";

const RATE_KEY = "forgot-password";


// Appel API
async function apiForgotPassword(email, pseudo) {
  const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, pseudo })
  });

  const body = await res.json();
  const retryAfter = res.headers.get("Retry-After");

  return { data: body, status: res.status, retryAfter };
}


// Gestion du formulaire pour un mot de passe oublié
function initForgotPasswordForm() {
  const form = document.querySelector(".auth-form-container");
  if (!form) return;

  const emailInput = document.querySelector("#email");
  const pseudoInput = document.querySelector("#pseudo");
  const submitBtn = document.querySelector(".btn.btn-secondary");

  function createError(input) {
    const el = document.createElement("p");
    el.classList.add("input-error");
    input.insertAdjacentElement("afterend", el);
    return el;
  }

  const emailError = createError(emailInput);
  const pseudoError = createError(pseudoInput);

  let touched = { email: false, pseudo: false };

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

    if (valid && isValidEmail(email) && isValidPseudo(pseudo) && getRateLimitRemaining(RATE_KEY) === 0) {
      submitBtn.classList.remove("btn-disabled");
    } else {
      submitBtn.classList.add("btn-disabled");
    }

    return valid;
  }

  // Affiche le message de blocage et désactive le bouton
  function applyBlock(ms, message) {
    const oldMsg = form.querySelector(".message");
    if (oldMsg) oldMsg.remove();

    const error = document.createElement("p");
    error.textContent = message;
    error.classList.add("message", "error-message");
    form.appendChild(error);

    setTimeout(() => error.classList.add("show"), 10);

    submitBtn.classList.add("btn-disabled");
    submitBtn.setAttribute("disabled", "true");

    setTimeout(() => {
      error.classList.remove("show");
      setTimeout(() => error.remove(), 300);

      clearRateLimit(RATE_KEY);
      submitBtn.removeAttribute("disabled");
      validateForm();
    }, ms);
  }

  function markTouched(field) {
    touched[field] = true;
    validateForm();
  }

  emailInput.addEventListener("input", () => markTouched("email"));
  pseudoInput.addEventListener("input", () => markTouched("pseudo"));

  validateForm();

  // Restaure un blocage encore actif après un refresh / changement de page
  const remaining = getRateLimitRemaining(RATE_KEY);
  if (remaining > 0) {
    applyBlock(remaining, "Trop de tentatives. Réessayez dans quelques instants.");
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (getRateLimitRemaining(RATE_KEY) > 0) return;
    if (!validateForm()) return;

    const email = sanitize(emailInput.value);
    const pseudo = sanitize(pseudoInput.value);

    const oldMsg = form.querySelector(".message");
    if (oldMsg) oldMsg.remove();

    const result = await apiForgotPassword(email, pseudo);

    if (result.status === 429) {
      const waitSeconds = result.retryAfter ? parseInt(result.retryAfter) : 60;

      saveRateLimit(RATE_KEY, waitSeconds);
      applyBlock(waitSeconds * 1000, result.data.message || "Trop de tentatives. Réessayez dans quelques instants.");

      return;
    }

    if (!result.data.success) {
      const error = document.createElement("p");
      error.textContent = result.data.message || "Erreur lors de l'envoi du mot de passe temporaire.";
      error.classList.add("message", "error-message");
      form.appendChild(error);
      setTimeout(() => error.classList.add("show"), 10);
      return;
    }

    const success = document.createElement("p");
    success.textContent = "Un mot de passe temporaire vous a été envoyé !";
    success.classList.add("message", "success-message");
    form.appendChild(success);

    setTimeout(() => success.classList.add("show"), 10);

    submitBtn.classList.add("btn-disabled");
    submitBtn.setAttribute("disabled", "true");

    setTimeout(() => {
      window.location.href = "/sign-in";
    }, 1500);
  });
}


// Lance le js de la page Forgot-passsword quand elle est chargée
function start() {
  initReveal();
  initForgotPasswordForm();
  initBackReload();
}

if (typeof window !== "undefined") start();
