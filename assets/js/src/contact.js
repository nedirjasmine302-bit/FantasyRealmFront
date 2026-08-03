import { initReveal } from "../modules/animations.js";
import { sanitize, isValidEmail, isValidPseudo } from "../modules/security.js";


// Appels API
async function apiGetMe(token) {
  try {
    const res = await fetch("http://localhost:8080/api/me", {
      headers: { "Authorization": "Bearer " + token }
    });
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    console.error("Erreur API me:", e);
    return null;
  }
}

async function apiSendContact(payload, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = "Bearer " + token;

  const res = await fetch("http://localhost:8080/api/contact", {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });

  return res.json();
}


async function initContactForm() {
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

  const token = localStorage.getItem("token");
  const logged = !!token;

  if (logged) {
    const me = await apiGetMe(token);
    if (me) {
      emailInput.value = me.email || "";
      pseudoInput.value = me.pseudo || "";
    }

    emailInput.setAttribute("readonly", true);
    emailInput.setAttribute("disabled", true);
    pseudoInput.setAttribute("readonly", true);
    pseudoInput.setAttribute("disabled", true);
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

    if (!logged && touched.email) {
      if (!isValidEmail(email)) {
        showError(emailError, "Email invalide");
        valid = false;
      } else hideError(emailError);
    }


    if (!logged && touched.pseudo) {
      if (pseudo !== "" && !isValidPseudo(pseudo)) {
        showError(pseudoError, "3 à 20 caractères (lettres, chiffres, _ -)");
        valid = false;
      } else hideError(pseudoError);
    }

    if (touched.message) {
      const length = message.trim().length;

      if (length === 0) {
        showError(messageError, "Veuillez entrer un message");
        valid = false;
      }
      else if (length < 30) {
        showError(messageError, "Le message doit contenir au moins 30 caractères");
        valid = false;
      }
      else {
        hideError(messageError);
      }
    }

    const emailOk = logged || isValidEmail(email);
    const pseudoOk = logged || pseudo === "" || isValidPseudo(pseudo);

    if (emailOk && pseudoOk && message.trim().length >= 30) {
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

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      email: sanitize(emailInput.value),
      pseudo: sanitize(pseudoInput.value),
      message: sanitize(messageInput.value)
    };

    const oldMsg = form.querySelector(".message");
    if (oldMsg) oldMsg.remove();

    const data = await apiSendContact(payload, token);

    const feedback = document.createElement("p");
    feedback.classList.add("message");

    if (!data || !data.success) {
      feedback.textContent = (data && data.message) || "Une erreur est survenue.";
      feedback.classList.add("error-message");
      form.appendChild(feedback);
      setTimeout(() => feedback.classList.add("show"), 10);
      return;
    }

    feedback.textContent = data.message || "Message envoyé avec succès !";
    feedback.classList.add("success-message");
    form.appendChild(feedback);
    setTimeout(() => feedback.classList.add("show"), 10);

    if (!logged) {
      emailInput.value = "";
      pseudoInput.value = "";
    }
    messageInput.value = "";

    touched = { email: false, pseudo: false, message: false };
    validateForm();

    setTimeout(() => {
      window.location.reload();
    }, 1500);
  });
}


// Test
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


// Lance le JS de la page Contact quand elle est chargée
function start() {
  initReveal();
  initContactForm();
}

if (typeof window !== "undefined") start();
