const AUTH_MSG_KEY = "authMessage";


// Décode la partie "payload" d'un JWT
function decodePayload(token) {
  try {
    const part = token.split(".")[1];
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}


// Vrai si le token est absent, illisible ou expiré.
export function isTokenExpired(token) {
  if (!token) return true;

  const payload = decodePayload(token);
  if (!payload || !payload.exp) return true;

  return payload.exp * 1000 <= Date.now();
}


// Vrai si l'utilisateur a un token encore valide.
export function isAuthenticated() {
  return !isTokenExpired(localStorage.getItem("token"));
}


// Déconnecte : vide le token et l'état de connexion.
export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("userLogged");
}


// Récupère et efface un éventuel message d'auth à afficher sur la connexion.
export function consumeAuthMessage() {
  const msg = sessionStorage.getItem(AUTH_MSG_KEY);
  if (msg) sessionStorage.removeItem(AUTH_MSG_KEY);
  return msg;
}


let modalShown = false;

// Affiche un modal bloquant : la seule sortie est de se reconnecter.
function showExpiredModal() {
  if (modalShown) return;
  modalShown = true;

  clearSession();

  const overlay = document.createElement("div");
  overlay.className = "session-expired-popup";
  overlay.style.display = "flex";
  overlay.innerHTML = `
    <div class="popup-content">
      <h3 class="popup-title">Session expirée</h3>
      <p class="confirm-hint">Votre session a expiré. Veuillez vous reconnecter pour continuer.</p>
      <div class="popup-buttons">
        <button type="button" class="btn btn-secondary" id="session-expired-btn">Se reconnecter</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  document.body.style.overflow = "hidden";

  overlay.querySelector("#session-expired-btn").addEventListener("click", () => {
    sessionStorage.setItem(AUTH_MSG_KEY, "expired");
    window.location.href = "/sign-in";
  });
}


// Surveille l'expiration du token et affiche un modal si nécessaire.
export function watchSessionExpiry() {
  function check() {
    const token = localStorage.getItem("token");
    if (!token) return false;

    if (isTokenExpired(token)) {
      showExpiredModal();
      return true;
    }
    return false;
  }

  if (check()) return;

  const token = localStorage.getItem("token");
  const payload = token ? decodePayload(token) : null;
  if (payload && payload.exp) {
    const ms = payload.exp * 1000 - Date.now();
    if (ms > 0) setTimeout(check, ms + 500);
  }

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) check();
  });
}
