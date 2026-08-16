// La fonction initCommentSecurity (validation du commentaire)
import { test, expect } from "vitest";
import { validateCommentForTest } from "../src/character-details.js";

test("commentaire vide = invalide", () => {
  expect(validateCommentForTest("", 3)).toBe(false);
});

test("rating = 0 = invalide", () => {
  expect(validateCommentForTest("Super perso", 0)).toBe(false);
});

test("commentaire + rating = valide", () => {
  expect(validateCommentForTest("Très bon personnage", 4)).toBe(true);
});

test("sanitize est bien appliqué", () => {
  expect(validateCommentForTest("<script>bad</script>", 5)).toBe(false);
});
