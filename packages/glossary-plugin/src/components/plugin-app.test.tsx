import * as React from "react";
import PluginApp from "./plugin-app";
import GlossaryPopup from "./glossary-popup";
import GlossarySidebar from "./glossary-sidebar";
import { shallow } from "enzyme";
import * as css from "./plugin-app.scss";

describe("PluginApp component", () => {
  const testWord = "test";
  const definitions = [
    {
      word: testWord,
      definition: "test definition"
    }
  ];
  const initialLearnerState = { definitions: {} };
  const pluginId = "123";

  let onWordClicked: (e: any) => null;
  let onPopupClosed: () => null;
  let onSidebarOpen: () => null;

  let MockAPI: any;
  let mockSidebarController: any;
  let mockPopupController: any;

  const simulateTestWordClick = () => {
    const event = { srcElement: { textContent: testWord }};
    onWordClicked(event);
  };

  // Setup MockAPI before each test to reset mock function counters (jest.fn()).
  beforeEach(() => {
    mockSidebarController = {
      close: jest.fn()
    };
    mockPopupController = {
      close: jest.fn()
    };

    MockAPI = {
      decorateContent: jest.fn((_1: any, _2: any, _3: any, listeners: any) => {
        // Save provided listener function.
        onWordClicked = listeners[0].listener;
      }),
      addPopup: jest.fn(options => {
        onPopupClosed = options.onClose;
        return mockPopupController;
      }),
      addSidebar: jest.fn(options => {
        onSidebarOpen = options.onOpen;
        return mockSidebarController;
      }),
      saveLearnerPluginState: jest.fn()
    };
  });

  it("calls decorateContent on load", () => {
    shallow(
      <PluginApp
        PluginAPI={MockAPI}
        pluginId={pluginId}
        definitions={definitions}
        initialLearnerState={initialLearnerState}
        askForUserDefinition={true}
      />
    );

    expect(MockAPI.decorateContent).toHaveBeenCalledTimes(1);
    expect(MockAPI.decorateContent).toHaveBeenCalledWith(
      ["test"],
      `<span class="${css.ccGlossaryWord}">$1</span>`,
      css.ccGlossaryWord,
      [{listener: expect.any(Function), type: "click"}]
    );
  });

  it("calls addPopup when a word is clicked and renders popup content", () => {
    const wrapper = shallow(
      <PluginApp
        PluginAPI={MockAPI}
        pluginId={pluginId}
        definitions={definitions}
        initialLearnerState={initialLearnerState}
        askForUserDefinition={true}
      />
    );

    simulateTestWordClick();

    expect(MockAPI.addPopup).toHaveBeenCalledTimes(1);
    expect((wrapper.state("openPopups") as any).length).toEqual(1);
    expect(wrapper.find(GlossaryPopup).length).toEqual(1);

    // Test if we cleanup things after popup is closed.
    onPopupClosed();
    expect((wrapper.state("openPopups") as any).length).toEqual(0);
    expect(wrapper.find(GlossaryPopup).length).toEqual(0);
  });

  it("calls saveLearnerPluginState when learner state is updated", () => {
    const wrapper = shallow(
      <PluginApp
        PluginAPI={MockAPI}
        pluginId={pluginId}
        definitions={definitions}
        initialLearnerState={initialLearnerState}
        askForUserDefinition={true}
      />
    );

    const component = wrapper.instance();
    const word = "test";
    const definition1 = "user definition 1";
    (component as PluginApp).learnerDefinitionUpdated(word, definition1);
    expect(MockAPI.saveLearnerPluginState).toHaveBeenCalledTimes(1);
    expect(MockAPI.saveLearnerPluginState).toHaveBeenCalledWith(pluginId, JSON.stringify({
      definitions: {[word]: [ definition1 ]}
    }));

    const definition2 = "user definition 2";
    (component as PluginApp).learnerDefinitionUpdated(word, definition2);
    expect(MockAPI.saveLearnerPluginState).toHaveBeenCalledTimes(2);
    expect(MockAPI.saveLearnerPluginState).toHaveBeenCalledWith(pluginId, JSON.stringify({
      definitions: {[word]: [ definition1, definition2 ]}
    }));
  });

  it("adds sidebar and render its content if PluginAPI provides this possibility", () => {
    const wrapper = shallow(
      <PluginApp
        PluginAPI={MockAPI}
        pluginId={pluginId}
        definitions={definitions}
        initialLearnerState={initialLearnerState}
        askForUserDefinition={true}
      />
    );
    expect(MockAPI.addSidebar).toHaveBeenCalledTimes(1);
    expect(wrapper.find(GlossarySidebar).length).toEqual(1);
  });

  it("ensures that popup and sidebar can't be visible at the same time", () => {
    shallow(
      <PluginApp
        PluginAPI={MockAPI}
        pluginId={pluginId}
        definitions={definitions}
        initialLearnerState={initialLearnerState}
        askForUserDefinition={true}
      />
    );

    simulateTestWordClick();
    expect(mockSidebarController.close).toHaveBeenCalledTimes(1);

    // Simulate sidebar opening.
    onSidebarOpen();
    expect(mockPopupController.close).toHaveBeenCalledTimes(1);
  });
});
