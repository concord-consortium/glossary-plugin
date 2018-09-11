import * as React from "react";
import GlossaryPopup from "./glossary-popup";
import Definition from "./definition";
import { shallow } from "enzyme";

describe("GlossaryPopup component", () => {
  describe("when askForUserDefinition=false", () => {
    it("renders Definition component", () => {
      const wrapper = shallow(
        <GlossaryPopup word="test" definition="test" userDefinitions={[]} askForUserDefinition={false}/>
      );
      expect(wrapper.find(Definition).length).toEqual(1);
    });
  });

  describe("when askForUserDefinition=true", () => {
    it("renders question that can be answered", () => {
      const word = "test";
      const definition = "test def";
      const onUserSubmit = jest.fn();
      const wrapper = shallow(
        <GlossaryPopup
          word={word}
          definition={definition}
          userDefinitions={[]}
          askForUserDefinition={true}
          onUserDefinitionsUpdate={onUserSubmit}/>
      );
      expect(wrapper.find(Definition).length).toEqual(0);
      expect(wrapper.text()).toEqual(expect.stringContaining(`What do you think "${word}" means?`));
      const textarea = wrapper.find("textarea");
      const submit = wrapper.find("[data-cy='submit']");
      expect(textarea.length).toEqual(1);
      expect(submit.length).toEqual(1);

      const userDef = "user definition";
      textarea.simulate("change", {target: {value: userDef}});
      submit.simulate("click");

      expect(onUserSubmit).toHaveBeenCalledTimes(1);
      expect(onUserSubmit).toBeCalledWith(userDef);

      expect(wrapper.find(Definition).length).toEqual(1);
    });

    describe("when user already answered a question", () => {
      it("renders user button allowing user to revise his answer", () => {
        const word = "test";
        const definition = "test def";
        const userDef = "user definition";
        const wrapper = shallow(
          <GlossaryPopup
            word={word}
            definition={definition}
            userDefinitions={[ userDef ]}
            askForUserDefinition={true}
          />
        );

        const reviseButton = wrapper.find("[data-cy='revise']");
        expect(reviseButton.length).toEqual(1);

        reviseButton.simulate("click");
        expect(wrapper.text()).toEqual(expect.stringContaining(`What do you think "${word}" means?`));
        expect(wrapper.find("textarea").length).toEqual(1);
        expect(wrapper.text()).toEqual(expect.stringContaining(userDef));
      });
    });
  });
});
