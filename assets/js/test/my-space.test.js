// La fonction toggleFavorite (pour les favoris)
import { test, expect } from "vitest";
import { toggleFavoriteForTest } from "../src/my-space.js";

test("toggleFavoriteForTest ajoute un favori", () => {
  let fav = [];
  fav = toggleFavoriteForTest(fav, "Thorn");
  expect(fav).toContain("Thorn");
});

test("toggleFavoriteForTest retire un favori", () => {
  let fav = ["Thorn"];
  fav = toggleFavoriteForTest(fav, "Thorn");
  expect(fav).not.toContain("Thorn");
});
