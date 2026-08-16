// Pour la sécurité
export function sanitize(str) {
  return str.replace(/[<>&"'`]/g, "");
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPseudo(pseudo) {
  return /^[a-zA-Z0-9_-]{3,20}$/.test(pseudo);
}

export function isValidEmployerPseudo(pseudo) {
  return /^[a-zA-Z0-9_-]{3,9}$/.test(pseudo);
}

export function isValidPassword(password) {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

export function isEmailUnique(email, list) {
  return !list.some(u => u.email.toLowerCase() === email.toLowerCase());
}
