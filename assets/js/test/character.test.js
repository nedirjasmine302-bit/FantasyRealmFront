// La fonction de filtrage des pseudos (pour l'autocomplete)
import { test, expect } from "vitest";
import { filterPseudosForTest } from "../src/character.js";

test("filterPseudosForTest retourne les pseudos qui commencent par la lettre donnée", () => {
  const list = ["Jasmine", "Jason", "Julien", "Kaedor"];

  const result = filterPseudosForTest(list, "Ja");

  expect(result).toEqual(["Jasmine", "Jason"]);
});

test("filterPseudosForTest retourne une liste vide si aucun pseudo ne correspond", () => {
  const list = ["Jasmine", "Jason", "Julien", "Kaedor"];

  const result = filterPseudosForTest(list, "zz");

  expect(result).toEqual([]);
});

test("filterPseudosForTest ignore la casse (majuscules/minuscules)", () => {
  const list = ["Jasmine", "Jason", "Julien", "Kaedor"];

  const result = filterPseudosForTest(list, "ja");

  expect(result).toEqual(["Jasmine", "Jason"]);
});
