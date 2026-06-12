// Animation d'apparition des éléments de la page au scroll
function initReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add("show");
    });
  });

  const elements = document.querySelectorAll(".fade-up, .scale-in, .blur-in");
  elements.forEach(el => observer.observe(el));
}


// Gestion utilisateur + sécurité front (Données fictives // Besoin API)
const user = {
  isLoggedIn: false,
  email: "jasmine@mail.com",
  pseudo: "Jasmine"
};

function sanitize(str) {
  return str.replace(/[<>&"'`]/g, "");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPseudo(pseudo) {
  if (pseudo.trim() === "") return true;
  return /^[a-zA-Z0-9_-]{3,20}$/.test(pseudo);
}

function initContactForm() {
  const emailInput = document.querySelector("#email");
  const pseudoInput = document.querySelector("#pseudo");
  const messageInput = document.querySelector("#message");
  const submitBtn = document.querySelector(".btn.btn-secondary");
  const form = document.querySelector(".contact-form-card");
  const successMsg = document.querySelector("#contact-success");

  if (!emailInput || !pseudoInput || !messageInput || !submitBtn || !form) return;

  if (user.isLoggedIn) {
    emailInput.value = user.email;
    pseudoInput.value = user.pseudo;
    pseudoInput.disabled = true;
  }

  function validateForm() {
    const email = sanitize(emailInput.value);
    const pseudo = sanitize(pseudoInput.value);
    const message = sanitize(messageInput.value);

    const emailValid = user.isLoggedIn ? true : isValidEmail(email);
    const pseudoValid = isValidPseudo(pseudo);
    const messageValid = message.trim() !== "";

    if (emailValid && pseudoValid && messageValid) {
      submitBtn.classList.remove("btn-disabled");
    } else {
      submitBtn.classList.add("btn-disabled");
    }
  }

  emailInput.addEventListener("input", validateForm);
  pseudoInput.addEventListener("input", validateForm);
  messageInput.addEventListener("input", validateForm);
  validateForm();

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = sanitize(emailInput.value);
    const pseudo = sanitize(pseudoInput.value);
    const message = sanitize(messageInput.value);
  
    if (!user.isLoggedIn && !isValidEmail(email)) {
      alert("Email invalide");
      return;
    }

    if (!isValidPseudo(pseudo)) {
      alert("Pseudo invalide");
      return;
    }

    if (message.trim() === "") {
      alert("Veuillez entrer un message");
      return;
    }

    successMsg.style.opacity = "1";

    if (!user.isLoggedIn) {
      emailInput.value = "";
      pseudoInput.value = "";
    }
    messageInput.value = "";

    validateForm();

    setTimeout(() => {
      window.location.reload();
    }, 1000);
  });
}


// Test pour la fonction d'autocomplétion
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


// Lance le JS de la page Contact de personnage quand elle est chargée
if (typeof window !== "undefined") {
  initReveal();
  initContactForm();
}