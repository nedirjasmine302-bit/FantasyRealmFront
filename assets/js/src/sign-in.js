import { initReveal } from "../modules/animations.js";
import { sanitize, isValidEmail } from "../modules/security.js";
import { initBackReload } from "../modules/back-reload.js";


// Appel API
async function signInApi(email, password) {
  try {
    const res = await fetch("http://localhost:8080/api/auth/sign-in", {
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

    if (isValidEmail(email) && password.length > 0) {
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

  validateForm();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const email = sanitize(emailInput.value);
    const password = sanitize(passwordInput.value);

    const oldMsg = form.querySelector(".message");
    if (oldMsg) oldMsg.remove();

    const { data, status, retryAfter } = await signInApi(email, password);

    if (status === 429) {
      const error = document.createElement("p");
      error.textContent = data.message || "Trop de tentatives. Réessayez dans quelques instants.";
      error.classList.add("message", "error-message");
      form.appendChild(error);
    
      setTimeout(() => error.classList.add("show"), 10);
    
      submitBtn.classList.add("btn-disabled");
      submitBtn.setAttribute("disabled", "true");
    
      const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 60000; 

      setTimeout(() => {
        error.classList.remove("show");
    
        setTimeout(() => error.remove(), 300);
    
        submitBtn.classList.remove("btn-disabled");
        submitBtn.removeAttribute("disabled");
      }, waitTime);
    
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

    setTimeout(() => {
      window.location.href = "/my-space";
    }, 1000);
  });
}


// Lance le JS de la page Sign-in quand elle est chargée
if (typeof window !== "undefined") {
  initReveal();
  initSignInForm();
  initBackReload();
}