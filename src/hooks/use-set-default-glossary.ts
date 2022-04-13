import { IGlossary } from "../types";

export const useSetDefaultGlossary = (initialGlossary: IGlossary, updateGlossary: (glossary: IGlossary) => void) => {
  if (Object.keys(initialGlossary).length === 0) {
    updateGlossary({
      askForUserDefinition: false,
      showSideBar: false,
      definitions: [],
      autoShowMediaInPopup: false,
      enableStudentRecording: false,
      enableStudentLanguageSwitching: false,
      translations: {}
    });
  }
};
