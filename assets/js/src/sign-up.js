import { initReveal } from "../modules/animations.js";
import { sanitize, isValidEmail, isValidPseudo, isValidPassword} from "../modules/security.js";
import { initBackReload } from "../modules/back-reload.js";


// Appel API
async function checkEmailUnique(email) {
  try {
    const res = await fetch("http://localhost:8080/api/check-email?email=" + encodeURIComponent(email));
    if (!res.ok) return true; // Erreur serveur : on ne bloque pas (le back revérifie au sign-up)
    const data = await res.json();
    return data.unique !== false; // "pris" seulement si le serveur le dit explicitement
  } catch (e) {
    console.error("Erreur API check-email:", e);
    return true; // Serveur injoignable : on ne prétend pas que l'email est déjà pris
  }
}

async function checkPseudoUnique(pseudo) {
  try {
    const res = await fetch("http://localhost:8080/api/check-pseudo?pseudo=" + encodeURIComponent(pseudo));
    if (!res.ok) return true; // Erreur serveur : on ne bloque pas (le back revérifie au sign-up)
    const data = await res.json();
    return data.unique !== false; // "pris" seulement si le serveur le dit explicitement
  } catch (e) {
    console.error("Erreur API check-pseudo:", e);
    return true; // Serveur injoignable : on ne prétend pas que le pseudo est déjà pris
  }
}


// Gestion du formulaire d'inscription
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

  async function validateForm() {
    const email = sanitize(emailInput.value);
    const pseudo = sanitize(pseudoInput.value);
    const password = sanitize(passwordInput.value);
    const password2 = sanitize(password2Input.value);

    let valid = true;

    if (touched.email) {
      if (!isValidEmail(email)) {
        showError(emailError, "Email invalide");
        valid = false;
      } else {
        const unique = await checkEmailUnique(email);
        if (!unique) {
          showError(emailError, "Cet email est déjà utilisé");
          valid = false;
        } else {
          hideError(emailError);
        }
      }
    }

    if (touched.pseudo) {
      if (!isValidPseudo(pseudo)) {
        showError(pseudoError, "3 à 20 caractères (lettres, chiffres, _ -)");
        valid = false;
      } else {
        const unique = await checkPseudoUnique(pseudo);
        if (!unique) {
          showError(pseudoError, "Ce pseudo est déjà utilisé");
          valid = false;
        } else {
          hideError(pseudoError);
        }
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
      await checkEmailUnique(email) &&
      isValidPseudo(pseudo) &&
      await checkPseudoUnique(pseudo) &&
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

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!await validateForm()) return;

    const payload = {
      email: sanitize(emailInput.value),
      pseudo: sanitize(pseudoInput.value),
      password: sanitize(passwordInput.value),
      password2: sanitize(password2Input.value)
    };

    const res = await fetch("http://localhost:8080/api/sign-up", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.message);
      return;
    }

    const success = document.createElement("p");
    success.textContent = data.message;
    success.classList.add("message", "success-message");
    form.appendChild(success);

    submitBtn.classList.add("btn-disabled");
    submitBtn.setAttribute("disabled", "true");

    setTimeout(() => success.classList.add("show"), 10);

    localStorage.setItem("userLogged", "true");

    setTimeout(() => {
      window.location.href = "/sign-in";
    }, 1000);
  });
}


// Lance le js de la page Sign-up quand elle est chargée
if (typeof window !== "undefined") {
  initReveal();
  initSignUpForm();
  initBackReload();
}