// La fonction toggleCard (pour les cards)
import { test, expect } from "vitest";
import { toggleCardForTest } from "../src/home.js";

test("toggleCardForTest active une card fermée", () => {
  const card = { active: false };
  const result = toggleCardForTest(card);
  expect(result.active).toBe(true);
});

test("toggleCardForTest désactive une card ouverte", () => {
  const card = { active: true };
  const result = toggleCardForTest(card);
  expect(result.active).toBe(false);
});
