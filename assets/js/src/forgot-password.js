// Animation d'apparition
function initReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add("show");
    });
  });

  const elements = document.querySelectorAll(".fade-up, .scale-in, .blur-in");
  elements.forEach(el => observer.observe(el));
}


// Pour la sécurité
function sanitize(str) {
  return str.replace(/[<>&"'`]/g, "");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPseudo(pseudo) {
  return /^[a-zA-Z0-9_-]{3,20}$/.test(pseudo);
}


const fakeUsers = [
  { email: "jasmine@mail.com", pseudo: "Jasmine" },
  { email: "test@mail.com", pseudo: "TestUser" },
  { email: "dragon@mail.com", pseudo: "DragonSlayer" }
];

function checkIdentity(email, pseudo) {
  return fakeUsers.some(
    u =>
      u.email.toLowerCase() === email.toLowerCase() &&
      u.pseudo.toLowerCase() === pseudo.toLowerCase()
  );
}


// Gestion du formulaire pour un mot de passe oublié (Données fictives // Besoin API)
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

    if (valid && isValidEmail(email) && isValidPseudo(pseudo)) {
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

  validateForm();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const email = sanitize(emailInput.value);
    const pseudo = sanitize(pseudoInput.value);

    const oldMsg = form.querySelector(".message");
    if (oldMsg) oldMsg.remove();

    if (!checkIdentity(email, pseudo)) {
      const error = document.createElement("p");
      error.textContent = "Cet email et ce pseudo ne correspondent à aucun compte.";
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


// Lance le js de la page forgot_passsword quand elle est chargée
if (typeof window !== "undefined") {
  initReveal();
  initForgotPasswordForm();
}
