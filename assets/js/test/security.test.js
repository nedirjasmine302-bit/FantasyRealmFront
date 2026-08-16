// Tests du module de sécurité (validations utilisées par tous les formulaires)
import { describe, test, expect } from "vitest";
import {
  sanitize,
  isValidEmail,
  isValidPseudo,
  isValidPassword,
  isEmailUnique
} from "../modules/security.js";


describe("sanitize", () => {
  test("retire les caractères dangereux (< > & \" ' `)", () => {
    expect(sanitize("<b>")).toBe("b");
    expect(sanitize("O'Brien")).toBe("OBrien");
    expect(sanitize('a"b&c`d')).toBe("abcd");
  });

  test("neutralise une balise script", () => {
    expect(sanitize("<script>alert('x')</script>")).toBe("scriptalert(x)/script");
  });

  test("laisse un texte normal intact", () => {
    expect(sanitize("Bonjour le monde 123")).toBe("Bonjour le monde 123");
  });
});


describe("isValidEmail", () => {
  test("accepte des emails corrects", () => {
    expect(isValidEmail("test@mail.fr")).toBe(true);
    expect(isValidEmail("a@b.co")).toBe(true);
  });

  test("refuse un email sans @", () => {
    expect(isValidEmail("testmail.fr")).toBe(false);
  });

  test("refuse un email sans point après le @", () => {
    expect(isValidEmail("test@mailfr")).toBe(false);
  });

  test("refuse un email contenant un espace", () => {
    expect(isValidEmail("test @mail.fr")).toBe(false);
  });

  test("refuse une chaîne vide", () => {
    expect(isValidEmail("")).toBe(false);
  });
});


describe("isValidPseudo", () => {
  test("accepte lettres, chiffres, tiret et underscore (3 à 20 caractères)", () => {
    expect(isValidPseudo("Jasmine")).toBe(true);
    expect(isValidPseudo("user_name-1")).toBe(true);
  });

  test("refuse moins de 3 caractères", () => {
    expect(isValidPseudo("ab")).toBe(false);
  });

  test("refuse plus de 20 caractères", () => {
    expect(isValidPseudo("a".repeat(21))).toBe(false);
  });

  test("refuse les espaces et caractères spéciaux", () => {
    expect(isValidPseudo("user name")).toBe(false);
    expect(isValidPseudo("user!")).toBe(false);
  });
});


describe("isValidPassword", () => {
  test("accepte un mot de passe conforme", () => {
    expect(isValidPassword("Test123!")).toBe(true);
  });

  test("refuse s'il manque une majuscule", () => {
    expect(isValidPassword("test123!")).toBe(false);
  });

  test("refuse s'il manque une minuscule", () => {
    expect(isValidPassword("TEST123!")).toBe(false);
  });

  test("refuse s'il manque un chiffre", () => {
    expect(isValidPassword("TestTest!")).toBe(false);
  });

  test("refuse s'il manque un caractère spécial", () => {
    expect(isValidPassword("Test1234")).toBe(false);
  });

  test("refuse s'il fait moins de 8 caractères", () => {
    expect(isValidPassword("Test12!")).toBe(false);
  });
});


describe("isEmailUnique", () => {
  const users = [
    { email: "jasmine@mail.fr" },
    { email: "test@mail.fr" }
  ];

  test("retourne true si l'email n'est pas dans la liste", () => {
    expect(isEmailUnique("nouveau@mail.fr", users)).toBe(true);
  });

  test("retourne false si l'email existe déjà", () => {
    expect(isEmailUnique("test@mail.fr", users)).toBe(false);
  });

  test("ignore la casse de l'email", () => {
    expect(isEmailUnique("TEST@MAIL.FR", users)).toBe(false);
  });

  test("retourne true sur une liste vide", () => {
    expect(isEmailUnique("test@mail.fr", [])).toBe(true);
  });
});
