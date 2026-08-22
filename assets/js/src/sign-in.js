import { API_BASE } from "../modules/config.js";
import { initReveal } from "../modules/animations.js";
import { sanitize, isValidEmail } from "../modules/security.js";
import { initBackReload } from "../modules/back-reload.js";
import { saveRateLimit, getRateLimitRemaining, clearRateLimit } from "../modules/rate-limit.js";
import { consumeAuthMessage } from "../modules/auth.js";

const RATE_KEY = "signin";
const RATE_MSG_KEY = "rateLimit:signin:msg";


// Affiche un message si l'utilisateur arrive ici après expiration de sa session
function showAuthNotice() {
  if (consumeAuthMessage() !== "expired") return;

  const form = document.querySelector(".auth-form-container");
  if (!form) return;

  const notice = document.createElement("p");
  notice.textContent = "Votre session a expiré, veuillez vous reconnecter.";
  notice.classList.add("message", "error-message");
  form.appendChild(notice);

  setTimeout(() => notice.classList.add("show"), 10);
}


// Appel API
async function signInApi(email, password) {
  try {
    const res = await fetch(`${API_BASE}/api/auth/sign-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const body = await res.json();
    const retryAfter = res.headers.get("Retry-After");

    return { data: body.data, status: res.status, retryAfter };
  } catch (e) {
    console.error("Erreur API sign-in:", e);
    return { data: { success: false, message: "Erreur serveur" }, status: 500 };
  }
}


// Récupère l'utilisateur connecté
async function apiGetMe(token) {
  try {
    const res = await fetch(`${API_BASE}/api/me`, {
      headers: { "Authorization": "Bearer " + token }
    });
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    console.error("Erreur API me:", e);
    return null;
  }
}

// Détermine la page d'accueil selon le rôle
async function resolveHomeRoute(token) {
  const me = await apiGetMe(token);
  const roles = me?.roles || [];

  if (roles.includes("ROLE_EMPLOYER") || roles.includes("ROLE_ADMIN")) {
    return "/management";
  }

  return "/my-space";
}


// Gestion du formulaire de connexion
function initSignInForm() {
  const form = document.querySelector(".auth-form-container");
  if (!form) return;

  const emailInput = document.querySelector("#email");
  const passwordInput = document.querySelector("#password");
  const submitBtn = document.querySelector(".btn.btn-secondary");

  function createErrorElement(input) {
    const error = document.createElement("p");
    error.classList.add("input-error");
    input.insertAdjacentElement("afterend", error);
    return error;
  }

  const emailError = createErrorElement(emailInput);
  const passwordError = createErrorElement(passwordInput);

  let touched = {
    email: false,
    password: false
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

    let valid = true;

    if (touched.email) {
      if (!isValidEmail(email)) {
        showError(emailError, "Email invalide");
        valid = false;
      } else {
        hideError(emailError);
      }
    }

    if (touched.password) {
      if (password.length < 1) {
        showError(passwordError, "Veuillez entrer votre mot de passe");
        valid = false;
      } else {
        hideError(passwordError);
      }
    }

    if (isValidEmail(email) && password.length > 0 && getRateLimitRemaining(RATE_KEY) === 0) {
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
      localStorage.removeItem(RATE_MSG_KEY);
      submitBtn.removeAttribute("disabled");
      validateForm();
    }, ms);
  }

  function markTouched(field) {
    touched[field] = true;
    validateForm();
  }

  emailInput.addEventListener("input", () => markTouched("email"));
  passwordInput.addEventListener("input", () => markTouched("password"));

  validateForm();

  // Restaure un blocage encore actif après un refresh / changement de page
  const remaining = getRateLimitRemaining(RATE_KEY);
  if (remaining > 0) {
    const savedMsg = localStorage.getItem(RATE_MSG_KEY) || "Trop de tentatives. Réessayez dans quelques instants.";
    applyBlock(remaining, savedMsg);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (getRateLimitRemaining(RATE_KEY) > 0) return;
    if (!validateForm()) return;

    const email = sanitize(emailInput.value);
    const password = sanitize(passwordInput.value);

    const oldMsg = form.querySelector(".message");
    if (oldMsg) oldMsg.remove();

    const { data, status, retryAfter } = await signInApi(email, password);

    if (status === 429) {
      const waitSeconds = retryAfter ? parseInt(retryAfter) : 60;
      const blockMsg = data.message || "Trop de tentatives. Réessayez dans quelques instants.";

      saveRateLimit(RATE_KEY, waitSeconds);
      localStorage.setItem(RATE_MSG_KEY, blockMsg);
      applyBlock(waitSeconds * 1000, blockMsg);

      return;
    }

    if (!data.success) {
      const error = document.createElement("p");
      error.textContent = data.message || "Identifiants incorrects";
      error.classList.add("message", "error-message");
      form.appendChild(error);
      setTimeout(() => error.classList.add("show"), 10);
      return;
    }

    if (data.user && data.user.temporaryPassword) {
      const tempMsg = document.createElement("p");
      tempMsg.textContent = "Vous utilisez un mot de passe temporaire. Redirection pour le modifier.";
      tempMsg.classList.add("message", "success-message");
      form.appendChild(tempMsg);

      setTimeout(() => tempMsg.classList.add("show"), 10);

      submitBtn.classList.add("btn-disabled");
      submitBtn.setAttribute("disabled", "true");

      setTimeout(() => {
        window.location.href = "/reset-password";
      }, 2500);

      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("userLogged", "true");

    const success = document.createElement("p");
    success.textContent = "Connexion réussie !";
    success.classList.add("message", "success-message");
    form.appendChild(success);

    setTimeout(() => success.classList.add("show"), 10);

    submitBtn.classList.add("btn-disabled");
    submitBtn.setAttribute("disabled", "true");

    const homeRoute = await resolveHomeRoute(data.token);

    setTimeout(() => {
      window.location.href = homeRoute;
    }, 1000);
  });
}


// Lance le JS de la page Sign-in quand elle est chargée
function start() {
  initReveal();
  showAuthNotice();
  initSignInForm();
  initBackReload();
}

if (typeof window !== "undefined") start();