import * as Ajv from "ajv";
import * as AjvKeywords from "ajv-keywords";
import schema from "../glossary-definition-schema";

let ajvSingleton: Ajv.Ajv;

const getAjv = () => {
  if (!ajvSingleton) {
    ajvSingleton = new Ajv({allErrors: true});
    // Add additional keywords supported by Ajv but not defined in JSON Schema spec.
    // It's useful, as it provides more powerful regexp (instead of pattern) that supports regexp flags.
    // More custom keywords: https://github.com/epoberezkin/ajv-keywords
    AjvKeywords(ajvSingleton);
  }
  return ajvSingleton;
};

interface IValidationResult {
  valid: boolean;
  error: string;
}

// Accepts glossary object. Validates it against JSON schema. Returns:
// {
//   valid: boolean;
//   error: string;
// }
// Note that errors can include multiple error messages.
export function validateGlossary(glossary: object): IValidationResult {
  const ajv = getAjv();
  const valid = ajv.validate(schema, glossary) as boolean;
  return { valid, error: ajv.errorsText(ajv.errors) };
}

// Accepts definition object. Validates it against JSON schema. Returns:
// {
//   valid: boolean;
//   error: string;
// }
// Note that errors can include multiple error messages.
export function validateDefinition(definition: object): IValidationResult {
  const ajv = getAjv();
  const valid = ajv.validate(schema.properties.definitions.items, definition) as boolean;
  return { valid, error: ajv.errorsText(ajv.errors) };
}
