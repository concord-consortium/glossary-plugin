import * as React from "react";
import GlossarySidebar from "./glossary-sidebar";
import Definition from "./definition";
import { shallow } from "enzyme";
import * as css from "glossary-sidebar.scss";

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
      const wrapper = shallow(
        <GlossarySidebar
          definitions={definitions}
          learnerDefinitions={learnerDefinitions}
        />
      );
      expect(wrapper.find("." + css.toggles).length).toEqual(1);
    });

    it("shows words that have learner definitions by default", () => {
      const wrapper = shallow(
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
      const wrapper = shallow(
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
  });
});
