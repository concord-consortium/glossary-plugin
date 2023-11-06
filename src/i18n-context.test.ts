import * as fetch from "jest-fetch-mock";
(global as any).fetch = fetch;

import {
  defaultTranslate,
  replaceVariables,
  fetchGlossary
} from "./i18n-context";
import { IGlossary } from "./types";

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

    it("should work in right to left languages", () => {
      const arabic = require("../src/lang/ar.json");
      const result = replaceVariables(arabic.mainPrompt, {word: "test"});
      expect(arabic.mainPrompt).toEqual("ما رأيك \"%{word}\" تعني؟");
      expect(result).toEqual("ما رأيك \"test\" تعني؟");
    });
  });

  describe("fetchGlossaryLanguages(glossaryUrl, callback)", () => {
    describe("When no glossaryUrl is provided", () => {
      it("should return the full set of default languages", () => {
        fetchGlossary(null, (x) => {
          expect(x.languageCodes.length).toBe(11);
        });
      });
    });
    describe("When a glossary with two translations is provided", () => {
      const glossaryUrl = "http://foo.bar/index.html";
      const glossary: IGlossary = {
        definitions: [],
        translations: {
          es: { "a.word": "es-word", "a.definition": "es-desc", "a.image_caption": "es-cap" },
          fr: { "a.word": "fr-word", "a.definition": "fr-desc", "a.image_caption": "fr-cap" }
        },
        askForUserDefinition: true,
        showSideBar: true,
        autoShowMediaInPopup: true,
        showIDontKnowButton: true,
        disableReadAloud: false,
        enableStudentRecording: true,
        enableStudentLanguageSwitching: true,
        showSecondLanguageFirst: false,
      };
      beforeEach(() => {
        fetch.mockResponse(JSON.stringify(glossary));
      });
      it("should only return the languages defined in the glossary at glossaryUrl", () => {
        fetchGlossary(glossaryUrl, (x) => {
          expect(x.languageCodes).toContain("fr");
          expect(x.languageCodes).toContain("es");
        });
      });
    });
  });
});
