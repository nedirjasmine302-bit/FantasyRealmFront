import { test, expect } from "vitest";
import { validateAccessoryForTest } from "../src/create-accessory.js";

test("nom vide = invalide", () => {
  const result = validateAccessoryForTest({
    name: "",
    description: "Une description valide qui dépasse 30 caractères.",
    image: "data:image/png;base64,...",
    selects: ["a", "b", "c"]
  });

  expect(result.valid).toBe(false);
  expect(result.errors.name).toBe("empty");
});

test("description trop courte = invalide", () => {
  const result = validateAccessoryForTest({
    name: "Mon Accessoire",
    description: "trop court",
    image: "data:image/png;base64,...",
    selects: ["a", "b", "c"]
  });

  expect(result.valid).toBe(false);
  expect(result.errors.description).toBe("too_short");
});

test("image manquante = invalide", () => {
  const result = validateAccessoryForTest({
    name: "Accessoire",
    description: "Une description suffisamment longue pour être valide.",
    image: null,
    selects: ["a", "b", "c"]
  });

  expect(result.valid).toBe(false);
  expect(result.errors.image).toBe("missing");
});

test("select manquant = invalide", () => {
  const result = validateAccessoryForTest({
    name: "Accessoire",
    description: "Une description suffisamment longue pour être valide.",
    image: "data:image/png;base64,...",
    selects: ["", "b", "c"]
  });

  expect(result.valid).toBe(false);
  expect(result.errors.selects).toBe("missing_value");
});

test("toutes les valeurs valides = valide", () => {
  const result = validateAccessoryForTest({
    name: "Accessoire",
    description: "Une description suffisamment longue pour être valide.",
    image: "data:image/png;base64,...",
    selects: ["a", "b", "c"]
  });

  expect(result.valid).toBe(true);
});
