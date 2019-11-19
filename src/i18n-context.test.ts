import * as fetch from "jest-fetch-mock";
(global as any).fetch = fetch;

import {
  defaultTranslate,
  replaceVariables,
  fetchGlossaryLanguages
} from "./i18n-context";

describe("pluginContext", () => {
  afterEach(() => {
    fetch.resetMocks();
  });
  describe("defaultTranslate function", () => {
    it("should return English translation when available", () => {
      expect(defaultTranslate("submit", "submitFallback")).toEqual("Submit");
    });

    it("should return fallback translation when English translation is not available", () => {
      expect(defaultTranslate("nonExistingKey", "fallback!")).toEqual("fallback!");
    });
  });

  describe("replaceVariables function", () => {
    it("should accept input string and variables hash and perform string substitution", () => {
      const variables = {
        var1: "123",
        variable_321: "XYZ"
      };
      const result = replaceVariables("test replaceVariables: %{var1} %{variable_321}!", variables);
      expect(result).toEqual("test replaceVariables: 123 XYZ!");
    });
  });

  describe("fetchGlossaryLanguages(glossaryUrl, callback)", () => {
    describe("When no glossaryUrl is provided", () => {
      it("should return the full set of default languages", () => {
        fetchGlossaryLanguages(null, (x) => {
          expect(x.length).toBe(9);
        });
      });
    });
    describe("When a glossary with two translations is provided", () => {
      const glossaryUrl = "http://foo.bar/index.html";
      const glossary = {
        definitions: {},
        translations: {
          es: { "a.word": "es-word", "a.definition": "es-desc", "a.image_caption": "es-cap" },
          fr: { "a.word": "fr-word", "a.definition": "fr-desc", "a.image_caption": "fr-cap" }
        }
      };
      beforeEach(() => {
        fetch.mockResponse(JSON.stringify(glossary));
      });
      it("should only return the languages defined in the glossary at glossaryUrl", () => {
        fetchGlossaryLanguages(glossaryUrl, (x) => {
          expect(x).toContain("fr");
          expect(x).toContain("en");
        });
      });
    });
  });
});
