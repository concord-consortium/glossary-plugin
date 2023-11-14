import * as React from "react";
import { shallow } from "enzyme";
import TranslationsPanel from "./translations-panel";
import { IGlossary } from "../../types";

// https://github.com/react-dropzone/react-dropzone/issues/554
jest.mock("react-dropzone", () => {
  return {default: "dropzone mock"};
});

const saveAsMock = jest.fn();
jest.mock("file-saver", () => {
  return {
    saveAs: (blob: Blob, filename: string) => saveAsMock(blob, filename)
  };
});

const defGlossary: IGlossary = {
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
  showIDontKnowButton: false,
  disableReadAloud: false,
  enableStudentRecording: false,
  enableStudentLanguageSwitching: false,
  showSecondLanguageFirst: false,
  translations: {
    es: {
      "cloud.word": "a",
      "cloud.definition": "b",
      "cloud.image_caption": "c"
    }
  }
};

describe("TranslationsPanel component", () => {
  it("renders basic UI", () => {
    const wrapper = shallow(<TranslationsPanel glossary={defGlossary} onGlossaryUpdate={jest.fn()} />);
    expect(wrapper.find("[data-cy='exportTerms']").length).toEqual(1);
    expect(wrapper.find("[data-cy='langUpload']").length).toEqual(1);
    expect(wrapper.find("table").length).toEqual(1);
    expect(wrapper.find("table").text()).toMatch("Spanish");
  });

  it("exports POEditor terms", () => {
    const wrapper = shallow(<TranslationsPanel glossary={defGlossary} onGlossaryUpdate={jest.fn()} />);
    wrapper.find("[data-cy='exportTerms']").simulate("click");
    expect(saveAsMock).toHaveBeenCalled();
    expect(saveAsMock.mock.calls[0][1]).toEqual("terms.json");
  });

  it("removes translation", () => {
    const onUpdate = jest.fn();
    const wrapper = shallow(<TranslationsPanel glossary={defGlossary} onGlossaryUpdate={onUpdate} />);
    wrapper.find({label: "Remove"}).simulate("click");
    expect(onUpdate).toHaveBeenCalledWith({
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
      showIDontKnowButton: false,
      disableReadAloud: false,
      enableStudentRecording: false,
      showSecondLanguageFirst: false,
      enableStudentLanguageSwitching: false,
      translations: {}
    } as IGlossary);
  });

  it("handles language file upload", async () => {
    let fileReaderResult = "";
    // Fake FileReader implementation.
    (window as any).FileReader = class FakeFileReader {
      public result: string;
      public onload: () => void;
      public readAsText() {
        setTimeout(() => {
          this.result = fileReaderResult;
          this.onload();
        }, 1);
      }
    };
    window.alert = jest.fn();
    const onUpdate = jest.fn();
    const wrapper = shallow(<TranslationsPanel glossary={defGlossary} onGlossaryUpdate={onUpdate} />);
    const instance = (wrapper.instance() as TranslationsPanel);

    // 1. Everything correct.
    fileReaderResult = `{
      "cloud.word": "x",
      "cloud.definition": "y",
      "cloud.image_caption": "z"
    }`;
    await instance.handleLanguageUpload([ new File(["ignored_value"], "result_Polish.txt") ]);
    expect(onUpdate).toHaveBeenCalledWith({
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
      showIDontKnowButton: false,
      disableReadAloud: false,
      enableStudentRecording: false,
      enableStudentLanguageSwitching: false,
      showSecondLanguageFirst: false,
      translations: {
        es: {
          "cloud.word": "a",
          "cloud.definition": "b",
          "cloud.image_caption": "c"
        },
        pl: {
          "cloud.word": "x",
          "cloud.definition": "y",
          "cloud.image_caption": "z"
        }
      }
    } as IGlossary);
    expect(window.alert).not.toHaveBeenCalled();

    // 2. Wrong filename (no language).
    jest.resetAllMocks();
    await instance.handleLanguageUpload([ new File(["ignored_value"], "result.txt") ]);
    expect(onUpdate).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith(
      "Language not detected in a filename: result.txt. Please ensure that the " +
      "filename hasn't been changed after exporting from POEditor."
    );

    // 3. Wrong data.
    fileReaderResult = `[{
      "term": "cloud.word"
    }]`;
    jest.resetAllMocks();
    await instance.handleLanguageUpload([ new File(["ignored_value"], "result_Polish.txt") ]);
    expect(onUpdate).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith(
      "Language file: result_Polish.txt has wrong format. Please export JSON *KEY-VALUE* instead."
    );
  });
});
