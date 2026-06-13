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


// Gestion du formulaire de connexion (Données fictives // Besoin API)
const fakeUsers = [
  { email: "test@mail.com", password: "Test123!", temporary: false },
  { email: "jasmine@mail.com", password: "Jasmine123!", temporary: false },
  { email: "temp@mail.com", password: "Temp123!", temporary: true }
];

function checkCredentials(email, password) {
  return fakeUsers.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
}

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
      } else hideError(emailError);
    }

    if (touched.password) {
      if (password.length < 1) {
        showError(passwordError, "Veuillez entrer votre mot de passe");
        valid = false;
      } else hideError(passwordError);
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

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    const email = sanitize(emailInput.value);
    const password = sanitize(passwordInput.value);
  
    const oldMsg = form.querySelector(".message");
    if (oldMsg) oldMsg.remove();
  
    const user = checkCredentials(email, password);

    if (!user) {
      const error = document.createElement("p");
      error.textContent = "Identifiants incorrects";
      error.classList.add("message", "error-message");
      form.appendChild(error);
  
      setTimeout(() => error.classList.add("show"), 10);
      return;
    }

    if (user.temporary) {
      const tempMsg = document.createElement("p");
      tempMsg.textContent = "Vous utilisez un mot de passe temporaire. Redirection pour le modifier.";
      tempMsg.classList.add("message", "success-message");
      form.appendChild(tempMsg);

      setTimeout(() => tempMsg.classList.add("show"), 10);

      submitBtn.classList.add("btn-disabled");
      submitBtn.setAttribute("disabled", "true");

      setTimeout(() => {
        window.location.href = "/reset-password";
      },2500);

      return;
    }

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
    }, 800);
  });
}


// Lance le js de la page Sign-in quand elle est chargée
if (typeof window !== "undefined") {
  initReveal();
  initSignInForm();
}
