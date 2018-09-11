import * as React from "react";
import * as ReactDOM from "react-dom";
import GlossaryPopup from "./glossary-popup";

import * as css from "./plugin-app.scss";

interface IPluginProps {
  PluginAPI: any;
  definitions: IWordDefinition[];
  initialLearnerState: ILearnerState;
  askForUserDefinition: boolean;
}

interface IWordDefinition {
  word: string;
  definition: string;
  image: string;
  video: string;
  imageCaption: string;
  videoCaption: string;
}

interface ILearnerState {
  definitions: { [word: string]: string[] };
}

interface IPluginState {
  openPopups: IOpenPopupDesc[];
  learnerState: ILearnerState;
}

interface IOpenPopupDesc {
  word: string;
  container: HTMLElement;
  popupController: any; // provided by LARA
}

export default class PluginApp extends React.Component<IPluginProps, IPluginState> {
  public state: IPluginState = {
    openPopups: [],
    learnerState: this.props.initialLearnerState
  };
  private definitionsByWord: { [word: string]: IWordDefinition };

  public componentDidMount() {
    const { definitions } = this.props;
    this.definitionsByWord = {};
    definitions.forEach(entry => {
      this.definitionsByWord[entry.word] = entry;
    });
    if (definitions.length > 0) {
      this.decorate();
    }
  }

  public render() {
    const { askForUserDefinition } = this.props;
    const { openPopups, learnerState } = this.state;

    return openPopups.map((desc: IOpenPopupDesc) => {
      const { word, container } = desc;
      return ReactDOM.createPortal(
        <GlossaryPopup
          word={word}
          definition={this.definitionsByWord[word].definition}
          imageUrl={this.definitionsByWord[word].image}
          videoUrl={this.definitionsByWord[word].video}
          imageCaption={this.definitionsByWord[word].imageCaption}
          videoCaption={this.definitionsByWord[word].videoCaption}
          userDefinitions={learnerState.definitions[word] || []}
          askForUserDefinition={askForUserDefinition}
          onUserDefinitionsUpdate={this.learnerDefinitionUpdated.bind(this, word)}
        />,
        container
      );
    });
  }

  private decorate() {
    const { definitions, PluginAPI } = this.props;
    const words = definitions.map(entry => entry.word);
    const replace = `<span class=${css.ccGlossaryWord}>$1</span>`;
    const listener = {
      type: "click",
      listener: this.wordClicked
    };
    PluginAPI.decorateContent(words, replace, css.ccGlossaryWord, [listener]);
  }

  private wordClicked = (evt: Event) => {
    const { PluginAPI } = this.props;
    const wordElement = evt.srcElement;
    const word = wordElement && wordElement.textContent || "";
    if (!this.definitionsByWord[word]) {
      // Ignore, nothing to do.
      return;
    }
    const { openPopups } = this.state;
    const container = document.createElement("div");
    const popupController = PluginAPI.addPopup({
      content: container,
      title: "Glossary",
      resizable: false,
      position: { my: "left top+10", at: "left bottom", of: wordElement, collision: "flip" },
      onClose: this.popupClosedByUser.bind(this, container)
    });
    const newOpenPopups = openPopups.concat({ word, container, popupController });
    this.setState({ openPopups: newOpenPopups });
  }

  private popupClosedByUser(container: HTMLElement) {
    // Keep state in sync. Popup can be closed using X sign in LARA. We don't control that.
    // Remove popup from list of opened popups. It will also ensure that Popup component will unmount correctly.
    const { openPopups } = this.state;
    const newOpenPopups = openPopups.filter((desc: IOpenPopupDesc) => desc.container !== container);
    this.setState({ openPopups: newOpenPopups });
  }

  private learnerDefinitionUpdated = (word: string, newDefinition: string) => {
    const { PluginAPI } = this.props;
    const { learnerState } = this.state;
    // Make sure that reference is updated, so React can detect changes. ImmutableJS could be helpful.
    const newLearnerState = Object.assign({}, learnerState);
    if (!newLearnerState.definitions[word]) {
      newLearnerState.definitions[word] = [];
    }
    newLearnerState.definitions[word] = newLearnerState.definitions[word].concat(newDefinition);
    this.setState({ learnerState: newLearnerState });
    PluginAPI.saveUserState(this, JSON.stringify(newLearnerState));
  }
}
