import * as React from "react";
import PluginApp from "./plugin-app";
import GlossaryPopup from "./glossary-popup";
import { shallow } from "enzyme";
import * as css from "./plugin-app.scss";

describe("PluginApp component", () => {
  const definitions = [
    {
      word: "test",
      definition: "test definition"
    }
  ];
  const initialLearnerState = { definitions: {} };
  const plugin = "it should be LARA plugin instance, but PluginAPP doesn't care";

  it("calls decorateContent on load", () => {
    const MockAPI = {
      decorateContent: jest.fn(),
    };
    shallow(
      <PluginApp
        PluginAPI={MockAPI}
        plugin={plugin}
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
    let onWordClicked = (e: any) => null;
    let onPopupClosed = () => null;

    const MockAPI = {
      decorateContent: (_1: any, _2: any, _3: any, listeners: any) => {
        // Save provided listener function.
        onWordClicked = listeners[0].listener;
      },
      addPopup: jest.fn(options => {
        onPopupClosed = options.onClose;
      }),
    };
    const wrapper = shallow(
      <PluginApp
        PluginAPI={MockAPI}
        plugin={plugin}
        definitions={definitions}
        initialLearnerState={initialLearnerState}
        askForUserDefinition={true}
      />
    );

    const event = { srcElement: { textContent: "test" }};
    // Simulate word click;
    onWordClicked(event);

    expect(MockAPI.addPopup).toHaveBeenCalledTimes(1);
    expect((wrapper.state("openPopups") as any).length).toEqual(1);
    expect(wrapper.find(GlossaryPopup).length).toEqual(1);

    // Test if we cleanup things after popup is closed.
    onPopupClosed();
    expect((wrapper.state("openPopups") as any).length).toEqual(0);
    expect(wrapper.find(GlossaryPopup).length).toEqual(0);
  });

  it("calls saveLearnerState when learner state is updated", () => {
    const MockAPI = {
      decorateContent: jest.fn(),
      saveLearnerState: jest.fn(),
    };

    const wrapper = shallow(
      <PluginApp
        PluginAPI={MockAPI}
        plugin={plugin}
        definitions={definitions}
        initialLearnerState={initialLearnerState}
        askForUserDefinition={true}
      />
    );

    const component = wrapper.instance();
    const word = "test";
    const definition1 = "user definition 1";
    (component as PluginApp).learnerDefinitionUpdated(word, definition1);
    expect(MockAPI.saveLearnerState).toHaveBeenCalledTimes(1);
    expect(MockAPI.saveLearnerState).toHaveBeenCalledWith(plugin, JSON.stringify({
      definitions: {[word]: [ definition1 ]}
    }));

    const definition2 = "user definition 2";
    (component as PluginApp).learnerDefinitionUpdated(word, definition2);
    expect(MockAPI.saveLearnerState).toHaveBeenCalledTimes(2);
    expect(MockAPI.saveLearnerState).toHaveBeenCalledWith(plugin, JSON.stringify({
      definitions: {[word]: [ definition1, definition2 ]}
    }));
  });
});
