// Pour afficher les animations
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      }
    });
  });

  document.querySelectorAll(".fade-up, .scale-in, .blur-in")
    .forEach(el => observer.observe(el));
}

// Animation de l'image (Section: About)
function initAboutTilt() {
  const wrapper = document.querySelector(".about-img-wrapper");
  if (!wrapper) return;

  const img = wrapper.querySelector(".about-img");

  wrapper.addEventListener("mousemove", (e) => {
    const rect = wrapper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateY = ((x / rect.width) - 0.5) * 12;
    const rotateX = ((y / rect.height) - 0.5) * -12;

    img.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  });

  wrapper.addEventListener("mouseleave", () => {
    img.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
  });
}

// Animation des cards (ouvrir/fermer)
function toggleCard(card) {
  const item = card.parentElement;
  item.classList.toggle("open");

  const allCards = document.querySelectorAll(".feature-card");
  const allDetails = document.querySelectorAll(".feature-detail");

  allCards.forEach(c => {
    if (c !== card) {
      c.parentElement.classList.remove("open");
      c.classList.remove("active");
      const icon = c.querySelector(".toggle");
      icon.classList.remove("bi-dash");
      icon.classList.add("bi-plus");
    }
  });

  allDetails.forEach(d => {
    if (d !== card.nextElementSibling) {
      d.classList.remove("show");
    }
  });

  const detail = card.nextElementSibling;
  const icon = card.querySelector(".toggle");

  card.classList.toggle("active");
  detail.classList.toggle("show");

  icon.classList.toggle("bi-plus", !card.classList.contains("active"));
  icon.classList.toggle("bi-dash", card.classList.contains("active"));
}

// Lance les animations quand la page Home est chargée
  initReveal();
  initAboutTilt();

