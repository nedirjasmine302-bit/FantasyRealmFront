// La fonction toggleMenu sans le DOM (pour le header)
import { test, expect } from "vitest";
import { toggleMenuForTest } from "../src/main.js";

test("toggleMenuForTest ouvre le menu si fermé", () => {
  const state = { open: false };
  const result = toggleMenuForTest(state);
  expect(result.open).toBe(true);
});

test("toggleMenuForTest ferme le menu si ouvert", () => {
  const state = { open: true };
  const result = toggleMenuForTest(state);
  expect(result.open).toBe(false);
});
