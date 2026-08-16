const PREFIX = "rateLimit:";

// Enregistre un blocage
export function saveRateLimit(key, seconds) {
  const until = Date.now() + seconds * 1000;
  localStorage.setItem(PREFIX + key, String(until));
}

// Retourne le nombre de millisecondes restantes avant la fin du blocage
export function getRateLimitRemaining(key) {
  const raw = localStorage.getItem(PREFIX + key);
  if (!raw) return 0;

  const until = parseInt(raw, 10);
  const remaining = until - Date.now();

  if (!Number.isFinite(until) || remaining <= 0) {
    localStorage.removeItem(PREFIX + key);
    return 0;
  }

  return remaining;
}

// Supprime le blocage
export function clearRateLimit(key) {
  localStorage.removeItem(PREFIX + key);
}
