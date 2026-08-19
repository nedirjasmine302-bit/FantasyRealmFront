const host =
  typeof window !== "undefined" ? window.location.hostname : "localhost";

const isLocal = host === "localhost" || host === "127.0.0.1";

export const API_BASE = isLocal
  ? "http://localhost:8080"
  : "https://fantasyrealmback-production.up.railway.app";
