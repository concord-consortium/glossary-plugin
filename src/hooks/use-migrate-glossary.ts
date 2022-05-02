import { IGlossary } from "../types";

export const useMigrateGlossary = (initialGlossary: IGlossary, updateGlossary: (glossary: IGlossary) => void) => {
  let glossary = initialGlossary;
  let glossaryChanged = false;

  if (Object.keys(glossary).length === 0) {
    glossary = {
      askForUserDefinition: false,
      showSideBar: false,
      definitions: [],
      autoShowMediaInPopup: false,
      disableReadAloud: false,
      showIDontKnowButton: false,
      enableStudentRecording: false,
      enableStudentLanguageSwitching: false,
      translations: {}
    }
    glossaryChanged = true
  }

  // ensure that the two needed collections are defined
  if (glossary.definitions == null) {
    glossary.definitions = [];
  }
  if (glossary.translations == null) {
    glossary.translations = {};
  }

  // use the term position in the array as a proxy for the created at and updated at times since new terms are added to the end of the array
  glossary.definitions.forEach((definition, index) => {
    if (!definition.createdAt) {
      definition.createdAt = index + 1;
      glossaryChanged = true;
    }
    if (!definition.updatedAt) {
      definition.updatedAt = index + 1;
      glossaryChanged = true;
    }
  });

  if (glossaryChanged) {
    updateGlossary(glossary);
  }
};
