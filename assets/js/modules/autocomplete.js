// Liste fictive utilisée par défaut (pages pas encore branchées à l'API)
const DEFAULT_PSEUDOS = [
  "Jasmine", "Jason", "Julien", "Jade",
  "Little_moon", "Kaedor", "Arthas", "Lunaria"
];


// Complète automatiquement le pseudo à partir d'une liste fournie
export function initAutocomplete(pseudos = DEFAULT_PSEUDOS, onSelect, selectors = {}) {
  const input = document.querySelector(selectors.input || "#pseudo-input");
  const suggestionsBox = document.querySelector(selectors.suggestions || "#suggestions");

  if (!input || !suggestionsBox) return;

  input.addEventListener("input", () => {
    const query = input.value.toLowerCase();

    if (query.length === 0) {
      suggestionsBox.innerHTML = "";
      suggestionsBox.classList.remove("active");
    } else {
      const results = pseudos.filter(p =>
        p.toLowerCase().startsWith(query)
      );

      suggestionsBox.innerHTML = results
        .map(r => `<div class="pseudo-suggestion-item">${r}</div>`)
        .join("");

      suggestionsBox.classList.toggle("active", results.length > 0);

      suggestionsBox.querySelectorAll(".pseudo-suggestion-item").forEach(item => {
        item.addEventListener("click", () => {
          input.value = item.textContent;
          suggestionsBox.innerHTML = "";
          suggestionsBox.classList.remove("active");
          if (onSelect) onSelect(input.value);
        });
      });
    }

    if (onSelect) onSelect(input.value);
  });
}
