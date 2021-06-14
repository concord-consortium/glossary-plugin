import * as React from "react";
import GlossarySidebar, { getWordsGrouping } from "./glossary-sidebar";
import Definition from "./definition";
import { shallow, mount } from "enzyme";
import * as css from "./glossary-sidebar.scss";
import {pluginContext} from "../../plugin-context";

describe("GlossarySidebar component", () => {
  const definitions = [
    {
      word: "test1",
      definition: "test definition 1"
    },
    {
      word: "test2",
      definition: "test definition 2"
    }
  ];

  describe("when there are no learner definitions", () => {
    const learnerDefinitions = {};

    it("renders provided definitions", () => {
      const wrapper = shallow(
        <GlossarySidebar
          definitions={definitions}
          learnerDefinitions={learnerDefinitions}
        />
      );
      expect(wrapper.find(Definition).length).toEqual(2);
      // This finds components with following properties subset:
      expect(wrapper.find({definition: "test definition 1"}).length).toEqual(1);
      expect(wrapper.find({definition: "test definition 2"}).length).toEqual(1);
    });

    it("does not render filter toggle", () => {
      const wrapper = shallow(
        <GlossarySidebar
          definitions={definitions}
          learnerDefinitions={learnerDefinitions}
        />
      );
      expect(wrapper.find("." + css.toggles).length).toEqual(0);
    });
  });

  describe("when there are some learner definitions", () => {
    const learnerDefinitions = {
      test1: [ "learner definition 1", "learner definition 2" ]
    };

    it("renders filter toggle", () => {
      const wrapper = mount(
        <GlossarySidebar
          definitions={definitions}
          learnerDefinitions={learnerDefinitions}
        />
      );
      expect(wrapper.find("." + css.toggles).length).toEqual(1);
    });

    it("shows words that have learner definitions by default", () => {
      const wrapper = mount(
        <GlossarySidebar
          definitions={definitions}
          learnerDefinitions={learnerDefinitions}
        />
      );
      expect(wrapper.find(Definition).length).toEqual(1);
      // This finds components with following properties subset:
      expect(wrapper.find({definition: "test definition 1"}).length).toEqual(1);
      expect(wrapper.find({definition: "test definition 2"}).length).toEqual(0);
    });

    it("lets user change filtering to show all the words", () => {
      const wrapper = mount(
        <GlossarySidebar
          definitions={definitions}
          learnerDefinitions={learnerDefinitions}
        />
      );

      wrapper.find("[data-cy='all-words-filter']").simulate("click");

      expect(wrapper.find(Definition).length).toEqual(2);
      // This finds components with following properties subset:
      expect(wrapper.find({definition: "test definition 1"}).length).toEqual(1);
      expect(wrapper.find({definition: "test definition 2"}).length).toEqual(1);
    });

    it("supports translations", () => {
      const translate = (key: string) => {
        return key + " in Spanish";
      };
      const wrapper = mount(
        <pluginContext.Provider value={{ lang: "es", translate, log: jest.fn() }}>
          <GlossarySidebar
            definitions={definitions}
            learnerDefinitions={learnerDefinitions}
          />
        </pluginContext.Provider>
      );
      expect(wrapper.text()).toEqual(expect.stringContaining("wordsIHaveDefined in Spanish"));
      expect(wrapper.text()).toEqual(expect.stringContaining("allWords in Spanish"));
    });
  });

  describe("when there are less than 50 authored definitions", () => {
    it("does not render grouping buttons", () => {
      const wrapper = shallow(
        <GlossarySidebar
          definitions={definitions}
          learnerDefinitions={{}}
        />
      );
      expect(wrapper.find("." + css.groupBtn).length).toEqual(0);
    });
  });

  describe("when there are more than 50 authored definitions", () => {
    const manyDefinitions: any[] = [];
    for (let i = 0; i < 51; i++) {
      // String.fromCharCode(65 + (i % 26)) will generate letters from A to Z.
      manyDefinitions.push({word: String.fromCharCode(65 + (i % 26)), definition: "test def " + i});
    }

    it("renders grouping buttons", () => {
      const wrapper = shallow(
        <GlossarySidebar
          definitions={manyDefinitions}
          learnerDefinitions={{}}
        />
      );
      const buttons = wrapper.find("." + css.groupBtn);
      expect(buttons.length).toEqual(7);
      expect(buttons.at(0).text()).toEqual(expect.stringContaining("A - D"));
      expect(buttons.at(1).text()).toEqual(expect.stringContaining("E - H"));
      expect(buttons.at(2).text()).toEqual(expect.stringContaining("I - L"));
      expect(buttons.at(3).text()).toEqual(expect.stringContaining("M - P"));
      expect(buttons.at(4).text()).toEqual(expect.stringContaining("Q - S"));
      expect(buttons.at(5).text()).toEqual(expect.stringContaining("T - W"));
      expect(buttons.at(6).text()).toEqual(expect.stringContaining("X - Z"));
    });
  });

  describe("when secondLanguage is provided", () => {
    it("renders language toggle and calls provided callback on click", () => {
      const onLangChange = jest.fn();
      const wrapper = mount(
        <GlossarySidebar
          definitions={definitions}
          learnerDefinitions={{}}
          languages={[{lang: "es", selected: false]}
          onLanguageChange={onLangChange}
        />
      );
      expect(wrapper.find("[data-cy='langToggle']").length).toEqual(1);
      wrapper.find("[data-cy='langToggle']").simulate("click");
      expect(onLangChange).toHaveBeenCalled();
    });
  });
});

describe("getWordsGrouping helper function", () => {
  it("divides range of words into reasonable groups", () => {
    expect(getWordsGrouping(["a", "b", "c", "d", "e", "f"], 2)).toEqual(["A - C", "D - F"]);
    expect(getWordsGrouping(["a", "b", "b", "b", "b", "f"], 2)).toEqual(["A - B", "F"]);
    expect(getWordsGrouping(["a", "b", "c", "d", "e", "f"], 3)).toEqual(["A - B", "C - D", "E - F"]);
    expect(getWordsGrouping(["a", "b", "c", "d", "e", "z"], 3)).toEqual(["A - B", "C - D", "E - Z"]);
    expect(getWordsGrouping(["a", "b", "c", "d", "e", "f", "y", "z"], 3)).toEqual(["A - C", "D - F", "Y - Z"]);
    expect(getWordsGrouping(["a", "ab", "ac", "ad", "b", "c"], 2)).toEqual(["A", "B - C"]);
    expect(getWordsGrouping(["a", "ab", "ac", "ad", "b", "c"], 3)).toEqual(["A", "B", "C"]);
    expect(getWordsGrouping(["a", "ab", "ac", "ad", "b", "c"], 10)).toEqual(["A", "B", "C"]);
  });
});
