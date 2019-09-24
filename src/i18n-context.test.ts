import { defaultTranslate, replaceVariables } from "./i18n-context";

describe("i18nContext", () => {
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
});
