import * as React from "react";
import PluginApp, { IDefinitionsByWord } from "./plugin-app";
import GlossaryPopup from "./glossary-popup";
import GlossarySidebar from "./glossary-sidebar";
import { shallow, mount } from "enzyme";
import * as css from "./plugin-app.scss";
import * as MockPluginAPI from "../../__mocks__/@concord-consortium/lara-plugin-api";

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
  const upperCaseDefinitions = [
    {
      word: "Test",
      definition: "test definition"
    }
  ];
  const initialLearnerState = { definitions: {} };

  // Setup MockPluginAPI before each test to reset mock function counters (jest.fn()).
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls pluralizes the definitions into a state variable on load", () => {
    const testPluralWord = `${testWord}s`;
    const wrapper = shallow(
      <PluginApp
        saveState={saveState}
        definitions={definitions}
        initialLearnerState={initialLearnerState}
        askForUserDefinition={true}
        autoShowMediaInPopup={false}
        showSideBar={true}
        disableReadAloud={false}
        translations={{}}
        enableStudentRecording={false}
        offlineMode={false}
        enableStudentLanguageSwitching={false}
        showIDontKnowButton={false}
        showSecondLanguageFirst={false}
      />
    );

    expect(definitions.length).toEqual(1);
    expect(definitions[0].word).toEqual(testWord);

    const definitionsByWord = wrapper.state("definitionsByWord") as IDefinitionsByWord;
    expect(Object.keys(definitionsByWord).length).toEqual(2);
    expect(definitionsByWord[testWord].word).toEqual(testWord);
    expect(definitionsByWord[testPluralWord].word).toEqual(testWord);
    expect(definitionsByWord[testPluralWord].definition).toEqual(definitionsByWord[testWord].definition);
  });

  it("does not pluralize already plural words", () => {
    const testPluralWord = "tests";
    const pluralDefinitions = [{word: testPluralWord, definition: "plural definition"}];
    const wrapper = shallow(
      <PluginApp
        saveState={saveState}
        definitions={pluralDefinitions}
        initialLearnerState={initialLearnerState}
        askForUserDefinition={true}
        autoShowMediaInPopup={false}
        showSideBar={true}
        disableReadAloud={false}
        translations={{}}
        enableStudentRecording={false}
        offlineMode={false}
        enableStudentLanguageSwitching={false}
        showIDontKnowButton={false}
        showSecondLanguageFirst={false}
      />
    );

    const definitionsByWord = wrapper.state("definitionsByWord") as IDefinitionsByWord;

    expect(pluralDefinitions.length).toEqual(1);
    expect(pluralDefinitions[0].word).toEqual(testPluralWord);

    expect(Object.keys(definitionsByWord).length).toEqual(1);
    expect(definitionsByWord[testPluralWord].word).toEqual(testPluralWord);
  });

  it("does not pluralize non-pluralizable words", () => {
    const nonPlualizableDefinitions = [
      {word: "moose", definition: "moose definition"},
      {word: "information", definition: "information definition"}
    ];
    const wrapper = shallow(
      <PluginApp
        saveState={saveState}
        definitions={nonPlualizableDefinitions}
        initialLearnerState={initialLearnerState}
        askForUserDefinition={true}
        autoShowMediaInPopup={false}
        showSideBar={true}
        disableReadAloud={false}
        translations={{}}
        enableStudentRecording={false}
        offlineMode={false}
        enableStudentLanguageSwitching={false}
        showIDontKnowButton={false}
        showSecondLanguageFirst={false}
      />
    );

    const definitionsByWord = wrapper.state("definitionsByWord") as IDefinitionsByWord;
    expect(nonPlualizableDefinitions.length).toEqual(2);
    expect(Object.keys(definitionsByWord).length).toEqual(2);
  });

  it("pluralizes irregular words", () => {
    const irregularDefinitions = [
      {word: "matrix", definition: "matrix definition"},
      {word: "person", definition: "person definition"}
    ];
    const wrapper = shallow(
      <PluginApp
        saveState={saveState}
        definitions={irregularDefinitions}
        initialLearnerState={initialLearnerState}
        askForUserDefinition={true}
        autoShowMediaInPopup={false}
        showSideBar={true}
        disableReadAloud={false}
        translations={{}}
        enableStudentRecording={false}
        offlineMode={false}
        enableStudentLanguageSwitching={false}
        showIDontKnowButton={false}
        showSecondLanguageFirst={false}
      />
    );

    const definitionsByWord = wrapper.state("definitionsByWord") as IDefinitionsByWord;
    expect(irregularDefinitions.length).toEqual(2);
    expect(Object.keys(definitionsByWord).length).toEqual(4);
    expect(definitionsByWord.matrix.word).toEqual("matrix");
    expect(definitionsByWord.matrices.word).toEqual("matrix");
    expect(definitionsByWord.matrices.definition).toEqual("matrix definition");
    expect(definitionsByWord.person.word).toEqual("person");
    expect(definitionsByWord.people.word).toEqual("person");
    expect(definitionsByWord.people.definition).toEqual("person definition");
  });

  it("calls decorateContent on load", () => {
    const wrapper = shallow(
      <PluginApp
        saveState={saveState}
        definitions={definitions}
        initialLearnerState={initialLearnerState}
        askForUserDefinition={true}
        autoShowMediaInPopup={false}
        enableStudentRecording={false}
        showSideBar={true}
        disableReadAloud={false}
        translations={{}}
        offlineMode={false}
        enableStudentLanguageSwitching={false}
        showIDontKnowButton={false}
        showSecondLanguageFirst={false}
      />
    );

    expect(MockPluginAPI.decorateContent).toHaveBeenCalledTimes(1);
    expect(MockPluginAPI.decorateContent).toHaveBeenCalledWith(
      ["test", "tests"],
      `<span class="${css.ccGlossaryWord}" style="text-decoration:underline; cursor:pointer;">$1</span>`,
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
        autoShowMediaInPopup={false}
        enableStudentRecording={false}
        showSideBar={true}
        disableReadAloud={false}
        translations={{}}
        offlineMode={false}
        enableStudentLanguageSwitching={false}
        showIDontKnowButton={false}
        showSecondLanguageFirst={false}
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
        autoShowMediaInPopup={false}
        enableStudentRecording={false}
        showSideBar={true}
        disableReadAloud={false}
        translations={{}}
        offlineMode={false}
        enableStudentLanguageSwitching={false}
        showIDontKnowButton={false}
        showSecondLanguageFirst={false}
      />
    );

    MockPluginAPI.simulateTestWordClick(testWord.toUpperCase());

    expect(MockPluginAPI.addPopup).toHaveBeenCalledTimes(1);
    expect((wrapper.state("openPopups") as any).length).toEqual(1);
    expect(wrapper.find(GlossaryPopup).length).toEqual(1);
  });

  it("calls addPopup when a lowercase word is clicked, even if the definition starts with an uppercase letter", () => {
    const wrapper = shallow(
      <PluginApp
        saveState={saveState}
        definitions={upperCaseDefinitions}
        initialLearnerState={initialLearnerState}
        askForUserDefinition={true}
        autoShowMediaInPopup={false}
        enableStudentRecording={false}
        showSideBar={true}
        disableReadAloud={false}
        translations={{}}
        offlineMode={false}
        enableStudentLanguageSwitching={false}
        showIDontKnowButton={false}
        showSecondLanguageFirst={false}
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
        autoShowMediaInPopup={false}
        enableStudentRecording={false}
        showSideBar={true}
        disableReadAloud={false}
        translations={{}}
        offlineMode={false}
        enableStudentLanguageSwitching={false}
        showIDontKnowButton={false}
        showSecondLanguageFirst={false}
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
        autoShowMediaInPopup={false}
        enableStudentRecording={false}
        showSideBar={true}
        disableReadAloud={false}
        translations={{}}
        offlineMode={false}
        enableStudentLanguageSwitching={false}
        showIDontKnowButton={false}
        showSecondLanguageFirst={false}
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
        autoShowMediaInPopup={false}
        enableStudentRecording={false}
        showSideBar={true}
        disableReadAloud={false}
        translations={{}}
        offlineMode={false}
        enableStudentLanguageSwitching={false}
        showIDontKnowButton={false}
        showSecondLanguageFirst={false}
      />
    );

    MockPluginAPI.simulateTestWordClick(testWord);
    expect(MockPluginAPI.mockSidebarController.close).toHaveBeenCalledTimes(1);

    // Simulate sidebar opening.
    MockPluginAPI.onSidebarOpen();
    expect(MockPluginAPI.mockPopupController.close).toHaveBeenCalledTimes(1);
  });

  it("hides the sidebar when showSideBar is false", () => {
    const wrapper = shallow(
      <PluginApp
        saveState={saveState}
        definitions={definitions}
        initialLearnerState={initialLearnerState}
        askForUserDefinition={true}
        autoShowMediaInPopup={false}
        enableStudentRecording={false}
        showSideBar={false}
        disableReadAloud={false}
        translations={{}}
        offlineMode={false}
        enableStudentLanguageSwitching={false}
        showIDontKnowButton={false}
        showSecondLanguageFirst={false}
      />
    );
    expect(wrapper.find(GlossarySidebar).length).toEqual(0);
  });

  describe("#translate method", () => {
    it("should pick using default internal translation strings", () => {
      const wrapper = mount(
        <PluginApp
          saveState={saveState}
          definitions={definitions}
          initialLearnerState={initialLearnerState}
          askForUserDefinition={true}
          autoShowMediaInPopup={false}
          enableStudentRecording={false}
          showSideBar={false}
          disableReadAloud={false}
          translations={{}}
          offlineMode={false}
          enableStudentLanguageSwitching={false}
          showIDontKnowButton={false}
          showSecondLanguageFirst={false}
        />
      );
      const pluginApp: PluginApp = (wrapper.instance() as PluginApp);
      expect(pluginApp.translate("submit")).toEqual("Submit");
      pluginApp.setState({ lang: "es" });
      expect(pluginApp.translate("submit")).toEqual("Enviar");
    });

    it("should pick translations from `translations` prop when available", () => {
      const wrapper = mount(
        <PluginApp
          saveState={saveState}
          definitions={definitions}
          initialLearnerState={initialLearnerState}
          askForUserDefinition={true}
          autoShowMediaInPopup={false}
          enableStudentRecording={false}
          showSideBar={false}
          disableReadAloud={false}
          translations={{
            es: {
              submit: "Enviar?!!"
            }
          }}
          offlineMode={false}
          enableStudentLanguageSwitching={false}
          showIDontKnowButton={false}
          showSecondLanguageFirst={false}
        />
      );
      const pluginApp: PluginApp = (wrapper.instance() as PluginApp);
      expect(pluginApp.translate("submit")).toEqual("Submit");
      pluginApp.setState({ lang: "es" });
      expect(pluginApp.translate("submit")).toEqual("Enviar?!!");
    });

  });
});
