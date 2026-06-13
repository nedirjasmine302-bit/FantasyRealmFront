// Les selects personnalisés dans le filtre
export function initCustomSelects() {
  document.querySelectorAll(".custom-select").forEach(select => {
    const trigger = select.querySelector(".custom-select-trigger");

    trigger.addEventListener("click", () => {
      document.querySelectorAll(".custom-select.open").forEach(other => {
        if (other !== select) other.classList.remove("open");
      });
      select.classList.toggle("open");
    });

    select.querySelectorAll(".custom-option").forEach(option => {
      option.addEventListener("click", () => {
        select.querySelector(".trigger-text").textContent = option.textContent;
        select.querySelector(".trigger-text").dataset.value = option.dataset.value;
        select.classList.remove("open");
      });
    });
  });

  document.addEventListener("click", (e) => {
    document.querySelectorAll(".custom-select.open").forEach(select => {
      if (!select.contains(e.target)) select.classList.remove("open");
    });
  });
}
