import * as React from "react";
import PluginApp from "./plugin-app";
import GlossaryPopup from "./glossary-popup";
import GlossarySidebar from "./glossary-sidebar";
import { shallow } from "enzyme";
import * as css from "./plugin-app.scss";
import * as MockPluginAPI from "../__mocks__/@concord-consortium/lara-plugin-api";

// Mock LARA API.
jest.mock("@concord-consortium/lara-plugin-api");

const saveState = jest.fn();

describe("PluginApp component", () => {
  const testWord = "test";
  const definitions = [
    {
      word: testWord,
      definition: "test definition"
    }
  ];
  const initialLearnerState = { definitions: {} };

  // Setup MockPluginAPI before each test to reset mock function counters (jest.fn()).
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls decorateContent on load", () => {
    shallow(
      <PluginApp
        saveState={saveState}
        definitions={definitions}
        initialLearnerState={initialLearnerState}
        askForUserDefinition={true}
      />
    );

    expect(MockPluginAPI.decorateContent).toHaveBeenCalledTimes(1);
    expect(MockPluginAPI.decorateContent).toHaveBeenCalledWith(
      ["test"],
      `<span class="${css.ccGlossaryWord}">$1</span>`,
      css.ccGlossaryWord,
      [{listener: expect.any(Function), type: "click"}]
    );
  });

  it("calls addPopup when a word is clicked and renders popup content", () => {
    const wrapper = shallow(
      <PluginApp
        saveState={saveState}
        definitions={definitions}
        initialLearnerState={initialLearnerState}
        askForUserDefinition={true}
      />
    );

    MockPluginAPI.simulateTestWordClick(testWord);

    expect(MockPluginAPI.addPopup).toHaveBeenCalledTimes(1);
    expect((wrapper.state("openPopups") as any).length).toEqual(1);
    expect(wrapper.find(GlossaryPopup).length).toEqual(1);

    // Test if we cleanup things after popup is closed.
    MockPluginAPI.onPopupClosed();
    expect((wrapper.state("openPopups") as any).length).toEqual(0);
    expect(wrapper.find(GlossaryPopup).length).toEqual(0);
  });

  it("calls addPopup when a word is clicked, even if starts with a capital letter", () => {
    const wrapper = shallow(
      <PluginApp
        saveState={saveState}
        definitions={definitions}
        initialLearnerState={initialLearnerState}
        askForUserDefinition={true}
      />
    );

    MockPluginAPI.simulateTestWordClick(testWord.toUpperCase());

    expect(MockPluginAPI.addPopup).toHaveBeenCalledTimes(1);
    expect((wrapper.state("openPopups") as any).length).toEqual(1);
    expect(wrapper.find(GlossaryPopup).length).toEqual(1);
  });

  it("calls saveState when learner state is updated", () => {
    const wrapper = shallow(
      <PluginApp
        saveState={saveState}
        definitions={definitions}
        initialLearnerState={initialLearnerState}
        askForUserDefinition={true}
      />
    );

    const component = wrapper.instance();
    const word = "test";
    const definition1 = "user definition 1";
    (component as PluginApp).learnerDefinitionUpdated(word, definition1);
    expect(saveState).toHaveBeenCalledTimes(1);
    expect(saveState).toHaveBeenCalledWith(JSON.stringify({
      definitions: {[word]: [ definition1 ]}
    }));

    const definition2 = "user definition 2";
    (component as PluginApp).learnerDefinitionUpdated(word, definition2);
    expect(saveState).toHaveBeenCalledTimes(2);
    expect(saveState).toHaveBeenCalledWith(JSON.stringify({
      definitions: {[word]: [ definition1, definition2 ]}
    }));
  });

  it("adds sidebar and render its content if MockPluginAPI provides this possibility", () => {
    const wrapper = shallow(
      <PluginApp
        saveState={saveState}
        definitions={definitions}
        initialLearnerState={initialLearnerState}
        askForUserDefinition={true}
      />
    );
    expect(MockPluginAPI.addSidebar).toHaveBeenCalledTimes(1);
    // This is important for correct styling when there're many entries in the sidebar. And it's easy
    // to break / change this style by accident and don't notice any issue. So, add an explicit test.
    expect(MockPluginAPI.addSidebar.mock.calls[0][0].content.style.maxHeight).toEqual("inherit");
    expect(wrapper.find(GlossarySidebar).length).toEqual(1);
  });

  it("ensures that popup and sidebar can't be visible at the same time", () => {
    shallow(
      <PluginApp
        saveState={saveState}
        definitions={definitions}
        initialLearnerState={initialLearnerState}
        askForUserDefinition={true}
      />
    );

    MockPluginAPI.simulateTestWordClick(testWord);
    expect(MockPluginAPI.mockSidebarController.close).toHaveBeenCalledTimes(1);

    // Simulate sidebar opening.
    MockPluginAPI.onSidebarOpen();
    expect(MockPluginAPI.mockPopupController.close).toHaveBeenCalledTimes(1);
  });
});
