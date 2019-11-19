import * as React from "react";
import { shallow,  ShallowWrapper } from "enzyme";
import { getHashParam, GLOSSARY_URL_PARAM} from "../../utils/get-url-param";
import * as fetch from "jest-fetch-mock";
import LanguageSelector from "./language-selector";
import {SUPPORTED_LANGUAGES} from "../../i18n-context";
(global as any).fetch = fetch;

const students = [
  {name: "student-a", id: "student-a", language: "en"},
  {name: "student-b", id: "student-b", language: "es"},
];

const classInfo = { source: "source", contextId: "context", students };

const cyTanslationsSel = "[data-cy='setTranslations']";
const languageSelector = (lang: string) => `[data-cy='language-${lang}']`;

describe("LanguageSelector component", () => {
  describe("when languages are not specified", () => {
    it("renders all the language options", () => {
      const wrapper = shallow(
        <LanguageSelector classInfo={classInfo} supportedLanguageCodes={SUPPORTED_LANGUAGES}/>
      );
      wrapper.find(cyTanslationsSel).simulate("click");
      expect(wrapper.find(languageSelector("en")).length).toEqual(0);
      SUPPORTED_LANGUAGES
        .filter( l => l !== "en")
        .forEach(l => expect(wrapper.find(languageSelector(l)).length).toEqual(1));
      expect(true).toBeTruthy();
    });
  });

  describe("When languages are specified", () => {
    it("renders only the language defined in the glossary", () => {
      const wrapper = shallow(
        <LanguageSelector classInfo={classInfo} supportedLanguageCodes={["es"]}/>
      );
      wrapper.find(cyTanslationsSel).simulate("click");
      expect(wrapper.find(languageSelector("es")).length).toEqual(1);
      expect(wrapper.find(languageSelector("en")).length).toEqual(0);
      expect(wrapper.find(languageSelector("de")).length).toEqual(0);
    });
  });

});
