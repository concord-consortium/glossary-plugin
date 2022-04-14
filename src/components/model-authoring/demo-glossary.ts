import { IGlossaryModelAuthoringInitialData } from "../../types";

export const demoGlossary: IGlossaryModelAuthoringInitialData = {
  name: "Demo Glossary",
  json: {
    askForUserDefinition: true,
    showSideBar: true,
    definitions: [
      {
        word: "test",
        definition: "this is the definition of the word test",
        image: "http://placekitten.com/200/300"
      },
      {
        word: "glossary",
        definition: "this is the definition of the word glossary"
      }
    ],
    autoShowMediaInPopup: true,
    enableStudentRecording: true,
    enableStudentLanguageSwitching: true,
    translations: {}
  }
};
