// Complète automatiquement le pseudo (Données fictives // Besoin API)
export function initAutocomplete() {
  const pseudos = [
    "Jasmine", "Jason", "Julien", "Jade",
    "Little_moon", "Kaedor", "Arthas", "Lunaria"
  ];

  const input = document.querySelector("#pseudo-input");
  const suggestionsBox = document.querySelector("#suggestions");

  if (!input || !suggestionsBox) return;

  input.addEventListener("input", () => {
    const query = input.value.toLowerCase();

    if (query.length === 0) {
      suggestionsBox.innerHTML = "";
      suggestionsBox.classList.remove("active");
      return;
    }

    const results = pseudos.filter(p =>
      p.toLowerCase().startsWith(query)
    );

    suggestionsBox.innerHTML = results
      .map(r => `<div class="pseudo-suggestion-item">${r}</div>`)
      .join("");

    suggestionsBox.classList.toggle("active", results.length > 0);

    document.querySelectorAll(".pseudo-suggestion-item").forEach(item => {
      item.addEventListener("click", () => {
        input.value = item.textContent;
        suggestionsBox.innerHTML = "";
        suggestionsBox.classList.remove("active");
      });
    });
  });
}
