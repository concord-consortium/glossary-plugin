import { glossaryToPOEditorTerms, isTranslationComplete } from "./translation-utils";

describe("#glossaryToPOEditorTerms", () => {
  it("returns POEditor terms", () => {
    const terms = glossaryToPOEditorTerms({
      definitions: [
        {
          word: "cloud",
          definition: "white thing",
          imageCaption: "white thing in the sky"
        }
      ],
      askForUserDefinition: false,
      showSideBar: false,
      autoShowMediaInPopup: false,
      enableStudentRecording: false,
      enableStudentLanguageSwitching: false
    });
    expect(terms["cloud.word"]).toEqual("cloud");
    expect(terms["cloud.definition"]).toEqual("white thing");
    expect(terms["cloud.image_caption"]).toEqual("white thing in the sky");
    // Make sure the term is defined even if caption is not provided yet.
    expect(terms["cloud.video_caption"]).toEqual("");
  });
});

describe("#isTranslationComplete", () => {
  it("returns true when translation is complete", () => {
    expect(isTranslationComplete({
      definitions: [
        {
          word: "cloud",
          definition: "white thing",
          imageCaption: "white thing in the sky"
        }
      ],
      askForUserDefinition: false,
      showSideBar: false,
      autoShowMediaInPopup: false,
      enableStudentRecording: false,
      enableStudentLanguageSwitching: false,
      translations: {
        es: {
          "cloud.word": "a",
          "cloud.definition": "b",
          "cloud.image_caption": "c"
        }
      }
    }, "es")).toEqual(true);
  });

  it("returns false when translation is not complete", () => {
    expect(isTranslationComplete({
      definitions: [
        {
          word: "cloud",
          definition: "white thing",
          imageCaption: "white thing in the sky"
        }
      ],
      askForUserDefinition: false,
      showSideBar: false,
      autoShowMediaInPopup: false,
      enableStudentRecording: false,
      enableStudentLanguageSwitching: false,
      translations: {
        es: {
          "cloud.word": "a",
          "cloud.definition": "b",
        }
      }
    }, "es")).toEqual(false);
  });
});
