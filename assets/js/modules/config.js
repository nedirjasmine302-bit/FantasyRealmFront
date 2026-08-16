// Configuration centralisée de l'API.
// L'URL de base est choisie automatiquement selon l'endroit où tourne le site :
//   - en local (localhost) ou en test  -> le back Docker sur le port 8080
//   - en ligne (Netlify)                -> le back déployé sur Railway
const host =
  typeof window !== "undefined" ? window.location.hostname : "localhost";

const isLocal = host === "localhost" || host === "127.0.0.1";

export const API_BASE = isLocal
  ? "http://localhost:8080"
  : "https://fantasyrealmback-production.up.railway.app";
