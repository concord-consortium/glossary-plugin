import * as React from "react";
import { shallow } from "enzyme";
import * as fetch from "jest-fetch-mock";
import LanguageSelector, { scaffoldedLevelReversed } from "./language-selector";
import {SUPPORTED_LANGUAGES} from "../../i18n-context";
import { IStudentSettings } from "../../types";
import { saveStudentSettings } from "../../db";
(global as any).fetch = fetch;

jest.mock("../../db", () => ({
  saveStudentSettings: jest.fn(),
  watchClassSettings:
    (source: string, contextId: string, onSnapshot: (settings: IStudentSettings[]) => void) => onSnapshot(settings)
}));

const saveStudentSettingsMock = saveStudentSettings as jest.Mock;

const students = [
  {name: "student-a", id: "student-a" },
  {name: "student-b", id: "student-b" },
];

const settings: IStudentSettings[] = [{
  userId: "student-a",
  preferredLanguage: "en",
  scaffoldedQuestionLevel: 2
}, {
  userId: "student-b",
  preferredLanguage: "es",
  scaffoldedQuestionLevel: 3
}];

const classInfo = { source: "source", contextId: "context", students };

const cyTanslationsSel = "[data-cy='setTranslations']";
const languageSelector = (lang: string) => `[data-cy='language-${lang}']`;

describe("LanguageSelector component", () => {
  beforeEach(() => {
    saveStudentSettingsMock.mockReset();
  });

  describe("when languages are not specified", () => {
    it("renders all the language options", () => {
      const wrapper = shallow(
        <LanguageSelector classInfo={classInfo} supportedLanguageCodes={SUPPORTED_LANGUAGES} />
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
        <LanguageSelector classInfo={classInfo} supportedLanguageCodes={["es"]} />
      );
      wrapper.find(cyTanslationsSel).simulate("click");
      expect(wrapper.find(languageSelector("es")).length).toEqual(1);
      expect(wrapper.find(languageSelector("en")).length).toEqual(0);
      expect(wrapper.find(languageSelector("de")).length).toEqual(0);
    });
  });

  describe("Scaffolded Question Level slider", () => {
    it("has value based on student settings", async () => {
      const wrapper = shallow(
        <LanguageSelector classInfo={classInfo} supportedLanguageCodes={SUPPORTED_LANGUAGES} />
      );

      wrapper.find(cyTanslationsSel).simulate("click");

      expect(wrapper.find("input[type='range']").length).toEqual(students.length);

      expect(wrapper.find("input[type='range']").at(0).props().step).toEqual(1);
      expect(wrapper.find("input[type='range']").at(0).props().min).toEqual(1);
      expect(wrapper.find("input[type='range']").at(0).props().max).toEqual(5);

      expect(wrapper.find("input[type='range']").at(0).props().value)
        .toEqual(scaffoldedLevelReversed(settings[0].scaffoldedQuestionLevel));
      expect(wrapper.find("input[type='range']").at(1).props().value)
        .toEqual(scaffoldedLevelReversed(settings[1].scaffoldedQuestionLevel));
    });

    it("updates student settings when moved", async () => {
      const wrapper = shallow(
        <LanguageSelector classInfo={classInfo} supportedLanguageCodes={SUPPORTED_LANGUAGES} />
      );

      wrapper.find(cyTanslationsSel).simulate("click");

      const newLevel = 5;
      wrapper.find("input[type='range']").at(0).simulate("change",
        { target: { value: scaffoldedLevelReversed(newLevel) }}
      );

      expect(saveStudentSettingsMock).toHaveBeenCalledTimes(1);
      expect(saveStudentSettingsMock.mock.calls[0][2]).toEqual(expect.objectContaining({
        scaffoldedQuestionLevel: newLevel
      }));
    });
  });
});
