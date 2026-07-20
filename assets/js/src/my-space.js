import { initReveal } from "../modules/animations.js";


// Appels API
async function apiGetMyCharacters(token) {
  try {
    const res = await fetch("http://localhost:8080/api/my-characters", {
      headers: { "Authorization": "Bearer " + token }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.characters || [];
  } catch (e) {
    console.error("Erreur API my-characters:", e);
    return [];
  }
}

async function apiGetFavoriteIds(token) {
  try {
    const res = await fetch("http://localhost:8080/api/favorites", {
      headers: { "Authorization": "Bearer " + token }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.favorites || []).map(f => f.id);
  } catch (e) {
    console.error("Erreur API favorites:", e);
    return [];
  }
}

async function apiRequestValidation(id, token) {
  const res = await fetch("http://localhost:8080/api/characters/" + id + "/request-validation", {
    method: "POST",
    headers: { "Authorization": "Bearer " + token }
  });

  return res.json();
}

async function apiToggleShare(id, token) {
  const res = await fetch("http://localhost:8080/api/characters/" + id + "/share", {
    method: "PATCH",
    headers: { "Authorization": "Bearer " + token }
  });

  return res.json();
}

async function apiDuplicate(id, token) {
  const res = await fetch("http://localhost:8080/api/characters/" + id + "/duplicate", {
    method: "POST",
    headers: { "Authorization": "Bearer " + token }
  });

  return res.json();
}

async function apiDelete(id, token) {
  const res = await fetch("http://localhost:8080/api/characters/" + id, {
    method: "DELETE",
    headers: { "Authorization": "Bearer " + token }
  });

  return res.json();
}

async function apiToggleFavorite(id, token, add) {
  const res = await fetch("http://localhost:8080/api/characters/" + id + "/favorite", {
    method: add ? "POST" : "DELETE",
    headers: { "Authorization": "Bearer " + token }
  });

  return res.json();
}


// Badge de statut
function statusBadge(status) {
  switch (status) {
    case "pending":
      return `<span class="status status-pending">En attente de validation</span>`;
    case "refused":
      return `<span class="status status-refused">Refusé</span>`;
    case "valid":
      return `<span class="status status-valid">Validé</span>`;
    default:
      return "";
  }
}


// Boutons selon le statut
function statusButtons(char) {
  if (char.status === "draft") {
    return `
      <div class="card-buttons">
        <a class="btn btn-secondary action-validate">Faire valider</a>
      </div>
      <div class="card-buttons">
        <a class="btn btn-secondary action-share">Partager</a>
      </div>
    `;
  }

  if (char.status === "valid" && char.shared) {
    return `
      <div class="card-buttons">
        <a class="btn btn-ghost-secondary action-share">Arrêter le partage</a>
      </div>
    `;
  }

  return `
    <div class="card-buttons">
      <a class="btn btn-secondary action-share">Partager</a>
    </div>
  `;
}


// Construit la carte d'un personnage
function renderCard(char, favoriteIds) {
  const isFav = favoriteIds.includes(char.id);
  const heartClass = isFav ? "bi-heart-fill" : "bi-heart";
  const activeClass = isFav ? " active" : "";

  return `
    <article class="card-horizontal" data-id="${char.id}">
      <div class="card-img-wrapper">
        <img src="${char.image}" alt="${char.name}" class="card-img">
      </div>

      <div class="card-content">
        <h3 class="card-name">${char.name.toUpperCase()}</h3>
        ${statusBadge(char.status)}
        ${statusButtons(char)}
      </div>

      <div class="card-actions">
        <a class="action-edit">Modifier</a>
        <span>|</span>
        <a class="action-duplicate">Dupliquer</a>
        <span>|</span>
        <a class="action-delete">Supprimer</a>
      </div>

      <button class="fav-btn">
        <i class="bi ${heartClass} heart${activeClass}"></i>
      </button>
    </article>
  `;
}


// Initialise la page Mon Espace : connexion, chargement et actions
async function initMySpace() {
  const container = document.querySelector(".characters-container");
  if (!container) return;

  const token = localStorage.getItem("token");
  if (!token) {
    container.innerHTML = `<p class="message error-message show text-center">Vous devez être connecté pour accéder à votre espace.</p>`;
    return;
  }

  async function loadAndRender() {
    const [characters, favoriteIds] = await Promise.all([
      apiGetMyCharacters(token),
      apiGetFavoriteIds(token)
    ]);

    if (characters.length === 0) {
      container.innerHTML = `<p class="message error-message show text-center">Vous n'avez pas encore créé de personnage.</p>`;
      return;
    }

    container.innerHTML = characters.map(c => renderCard(c, favoriteIds)).join("");
  }

  await loadAndRender();

  container.addEventListener("click", async (e) => {
    const card = e.target.closest(".card-horizontal");
    if (!card) return;

    const id = Number(card.dataset.id);

    if (e.target.classList.contains("action-edit")) {
      window.location.href = "create-character?id=" + id;
      return;
    }

    if (e.target.classList.contains("action-validate")) {
      const data = await apiRequestValidation(id, token);
      if (data && data.success) await loadAndRender();
      return;
    }

    if (e.target.classList.contains("action-share")) {
      const data = await apiToggleShare(id, token);
      if (data && data.success) await loadAndRender();
      return;
    }

    if (e.target.classList.contains("action-duplicate")) {
      const data = await apiDuplicate(id, token);
      if (data && data.success) await loadAndRender();
      return;
    }

    if (e.target.classList.contains("action-delete")) {
      const data = await apiDelete(id, token);
      if (data && data.success) await loadAndRender();
      return;
    }

    if (e.target.classList.contains("heart")) {
      const isFav = e.target.classList.contains("active");
      const data = await apiToggleFavorite(id, token, !isFav);

      if (data && data.success) {
        if (data.favorite) {
          e.target.classList.add("active");
          e.target.classList.replace("bi-heart", "bi-heart-fill");
        } else {
          e.target.classList.remove("active");
          e.target.classList.replace("bi-heart-fill", "bi-heart");
        }
      }
      return;
    }
  });
}


// Test
export function toggleFavoriteForTest(fav, name) {
  return fav.includes(name)
    ? fav.filter(f => f !== name)
    : [...fav, name];
}


// Lance le js de la page My-space quand elle est chargée
if (typeof window !== "undefined") {
  initReveal();
  initMySpace();
}
