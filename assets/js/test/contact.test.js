// La fonction getContactFormState (pour pré-remplir les champs du formulaire de contact)
import { test, expect } from "vitest";
import { getContactFormState } from "../src/contactLogic.js";

test("remplit les champs si l'utilisateur est connecté", () => {
  const user = {
    isLoggedIn: true,
    email: "test@mail.com",
    pseudo: "Jasmine"
  };

  const result = getContactFormState(user);

  expect(result.email).toBe("test@mail.com");
  expect(result.pseudo).toBe("Jasmine");
  expect(result.pseudoDisabled).toBe(true);
  expect(result.pseudoPlaceholder).toBe("Votre pseudo");
});

test("pseudo optionnel si utilisateur non connecté", () => {
  const user = { isLoggedIn: false };

  const result = getContactFormState(user);

  expect(result.email).toBe("");
  expect(result.pseudo).toBe("");
  expect(result.pseudoDisabled).toBe(false);
  expect(result.pseudoPlaceholder).toBe("Votre pseudo (optionnel)");
});
