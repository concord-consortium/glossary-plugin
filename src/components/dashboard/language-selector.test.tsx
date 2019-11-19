import * as React from "react";
import { shallow, mount, ReactWrapper } from "enzyme";
import { getHashParam, GLOSSARY_URL_PARAM} from "../../utils/get-url-param";
import * as fetch from "jest-fetch-mock";
import LanguageSelector from "./language-selector";
import {SUPPORTED_LANGUAGES} from "../../i18n-context";
(global as any).fetch = fetch;

const students = [
  {name: "student-a", id: "student-a", language: "en"},
  {name: "student-b", id: "student-b", language: "es"},
];

const classInfo = {
  source: "source",
  contextId: "context",
  students
};

// 2019-11-19 NP: We will want to test the URL parsing too, this is a start:
// const glossaryUrl = "http://foo.bar/index.html";
// const glossary = {
//   definitions: {},
//   translations: {
//     es: {
//       "cloud.word": "a",
//       "cloud.definition": "b",
//       "cloud.image_caption": "c"
//     }
//   }
// };

const cyTanslationsSel = "[data-cy='setTranslations']";

const findLanguage = (wrapper: ReactWrapper, lang: string) => {
  const selector = `[data-cy='language-${lang}']`;
  expect(wrapper.find(selector).length).toEqual(1);
};

const dontFindLanguage = (wrapper: ReactWrapper, lang: string) => {
  const selector = `[data-cy='language-${lang}']`;
  expect(wrapper.find(selector).length).toEqual(0);
};

describe("LanguageSelector component", () => {
  describe("when languages are not specified", () => {
    it("renders all the language options", () => {
      const wrapper = mount(
        <LanguageSelector classInfo={classInfo} supportedLanguageCodes={SUPPORTED_LANGUAGES}/>
      );
      wrapper.find(cyTanslationsSel).simulate("click");
      dontFindLanguage(wrapper, "en");
      SUPPORTED_LANGUAGES
        .filter( l => l !== "en")
        .forEach(l => findLanguage(wrapper, l));
    });
  });

  describe("When languages are specified", () => {
    it("renders only the language defined in the glossary", () => {
      const wrapper = mount(
        <LanguageSelector classInfo={classInfo} supportedLanguageCodes={["es"]}/>
      );
      wrapper.find(cyTanslationsSel).simulate("click");
      findLanguage(wrapper, "es");
      dontFindLanguage(wrapper, "en");
      dontFindLanguage(wrapper, "de");
    });
  });

});
