import * as React from "react";
import GlossaryPopup from "./glossary-popup";
import Definition from "./definition";
import { shallow, mount } from "enzyme";
import {i18nContext} from "../i18n-context";

describe("GlossaryPopup component", () => {
  describe("when askForUserDefinition=false", () => {
    it("renders Definition component", () => {
      const wrapper = shallow(
        <GlossaryPopup word="test" definition="test" userDefinitions={[]} askForUserDefinition={false}/>
      );
      expect(wrapper.find(Definition).length).toEqual(1);
      const reviseButton = wrapper.find("[data-cy='revise']");
      expect(reviseButton.length).toEqual(0);
    });
  });

  describe("when askForUserDefinition=true", () => {
    it("renders question that can be answered", () => {
      const word = "test";
      const definition = "test def";
      const onUserSubmit = jest.fn();
      const wrapper = mount(
        <GlossaryPopup
          word={word}
          definition={definition}
          userDefinitions={[]}
          askForUserDefinition={true}
          onUserDefinitionsUpdate={onUserSubmit}
        />
      );
      expect(wrapper.find(Definition).length).toEqual(0);
      expect(wrapper.text()).toEqual(expect.stringContaining(`What do you think "${word}" means?`));
      const textarea = wrapper.find("textarea");
      const submit = wrapper.find("[data-cy='submit']");
      expect(textarea.length).toEqual(1);
      expect(textarea.props().placeholder).toEqual("Write the definition in your own words here.");
      expect(submit.length).toEqual(1);

      const userDef = "user definition";
      textarea.simulate("change", {target: {value: userDef}});
      submit.simulate("click");

      expect(onUserSubmit).toHaveBeenCalledTimes(1);
      expect(onUserSubmit).toBeCalledWith(userDef);

      expect(wrapper.find(Definition).length).toEqual(1);
    });

    it("user can click 'I don't know' button", () => {
      const word = "test";
      const definition = "test def";
      const onUserSubmit = jest.fn();
      const wrapper = mount(
        <GlossaryPopup
          word={word}
          definition={definition}
          userDefinitions={[]}
          askForUserDefinition={true}
          onUserDefinitionsUpdate={onUserSubmit}
        />
      );
      const IDontKnow = wrapper.find("[data-cy='cancel']");
      IDontKnow.simulate("click");

      expect(onUserSubmit).toHaveBeenCalledTimes(1);
      expect(onUserSubmit).toBeCalledWith("I don't know yet");
    });

    describe("when user already answered a question", () => {
      it("still asks user to revise his answer", () => {
        const word = "test";
        const definition = "test def";
        const userDefinitions = ["user definition"];
        const wrapper = mount(
          <GlossaryPopup
            word={word}
            definition={definition}
            userDefinitions={userDefinitions}
            askForUserDefinition={true}
          />
        );
        const textarea = wrapper.find("textarea");
        expect(wrapper.text()).toEqual(expect.stringContaining(`What do you think "${word}" means?`));
        expect(wrapper.find("textarea").length).toEqual(1);
        expect(textarea.props().placeholder).toEqual("Write your new definition in your own words here.");
      });
    });
  });

  describe("when secondLanguage is provided", () => {
    it("renders language toggle and calls provided callback on click", () => {
      const onLangChange = jest.fn();
      const wrapper = shallow(
        <GlossaryPopup
          word="test"
          definition="test"
          userDefinitions={[]}
          askForUserDefinition={false}
          secondLanguage="es"
          onLanguageChange={onLangChange}
        />
      );
      expect(wrapper.find("[data-cy='langToggle']").length).toEqual(1);
      wrapper.find("[data-cy='langToggle']").simulate("click");
      expect(onLangChange).toHaveBeenCalled();
    });
  });

  it("supports translations", () => {
    const translate = (key: string) => {
      return key + " in Spanish";
    };
    const wrapper = mount(
      <i18nContext.Provider value={{ translate }}>
        <GlossaryPopup
          word="test"
          definition="test"
          userDefinitions={[]}
          askForUserDefinition={true}
        />
      </i18nContext.Provider>
    );
    expect(wrapper.text()).toEqual(expect.stringContaining("mainPrompt in Spanish"));
    expect(wrapper.text()).toEqual(expect.stringContaining("submit in Spanish"));
  });
});
