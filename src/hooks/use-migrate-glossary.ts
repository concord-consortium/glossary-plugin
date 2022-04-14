import { IGlossary } from "../types";

export const useMigrateGlossary = (initialGlossary: IGlossary, updateGlossary: (glossary: IGlossary) => void) => {
  let glossary = initialGlossary;
  let glossaryChanged = false;

  if (Object.keys(initialGlossary).length === 0) {
    glossary = {
      askForUserDefinition: false,
      showSideBar: false,
      definitions: [],
      autoShowMediaInPopup: false,
      enableStudentRecording: false,
      enableStudentLanguageSwitching: false,
      translations: {}
    }
    glossaryChanged = true
  }

  glossary.definitions.forEach((definition, index) => {
    if (!definition.updatedAt) {
      definition.updatedAt = index + 1;
      glossaryChanged = true;
    }
  });

  if (glossaryChanged) {
    updateGlossary(glossary);
  }
};
