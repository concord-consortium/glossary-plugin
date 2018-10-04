import * as React from "react";
import * as ReactDOM from "react-dom";
import GlossaryPopup from "./glossary-popup";
import GlossarySidebar from "./glossary-sidebar";
import { IWordDefinition, ILearnerDefinitions } from "./types";

import * as css from "./plugin-app.scss";
import * as icons from "./icons.scss";

interface ILearnerState {
  definitions: ILearnerDefinitions;
}

interface IOpenPopupDesc {
  word: string;
  container: HTMLElement;
  popupController: any; // provided by LARA
}

interface ISidebarController {
  open: () => void;
  close: () => void;
}

interface IProps {
  PluginAPI: any;
  pluginId: string; // plugin instance ID that needs to be passed to LARA.saveLearnerState
  definitions: IWordDefinition[];
  initialLearnerState: ILearnerState;
  askForUserDefinition: boolean;
}

interface IState {
  openPopups: IOpenPopupDesc[];
  learnerState: ILearnerState;
  sidebarPresent: boolean;
}

export default class PluginApp extends React.Component<IProps, IState> {
  public state: IState = {
    openPopups: [],
    learnerState: this.props.initialLearnerState,
    sidebarPresent: false
  };
  private definitionsByWord: { [word: string]: IWordDefinition };
  private sidebarContainer: HTMLElement;
  private sidebarIconContainer: HTMLElement;
  private sidebarController: ISidebarController;

  public componentDidMount() {
    const { definitions } = this.props;
    this.definitionsByWord = {};
    definitions.forEach(entry => {
      this.definitionsByWord[entry.word.toLowerCase()] = entry;
    });
    if (definitions.length === 0) {
      // Nothing to do.
      return;
    }
    this.decorate();
    this.addSidebar();
  }

  public render() {
    const { askForUserDefinition, definitions } = this.props;
    const { openPopups, learnerState, sidebarPresent } = this.state;

    // Note that returned div will be empty in fact. We render only into React Portals.
    // It's possible to return array instead, but it seems to cause some cryptic errors in tests.
    return (
      <div>
        {
          // Render sidebar into portal.
          // Do not render user definitions if askForUserDefinition mode is disabled.
          // Note that they might be available if previously this mode was enabled.
          sidebarPresent && ReactDOM.createPortal(
            <GlossarySidebar
              definitions={definitions}
              learnerDefinitions={askForUserDefinition ? learnerState.definitions : {}}
            />,
            this.sidebarContainer
          )
        }
        {
          // Render sidebar icon into portal.
          sidebarPresent && ReactDOM.createPortal(
            <span className={css.sidebarIcon + " " + icons.iconBook}/>,
            this.sidebarIconContainer
          )
        }
        {
          // Render popups into portals.
          // Do not render user definitions if askForUserDefinition mode is disabled.
          // Note that they might be available if previously this mode was enabled.
          openPopups.length === 0 ? null : openPopups.map((desc: IOpenPopupDesc) => {
            const {word, container} = desc;
            return ReactDOM.createPortal(
              <GlossaryPopup
                word={word}
                definition={this.definitionsByWord[word].definition}
                imageUrl={this.definitionsByWord[word].image}
                videoUrl={this.definitionsByWord[word].video}
                imageCaption={this.definitionsByWord[word].imageCaption}
                videoCaption={this.definitionsByWord[word].videoCaption}
                userDefinitions={learnerState.definitions[word]}
                askForUserDefinition={askForUserDefinition}
                onUserDefinitionsUpdate={this.learnerDefinitionUpdated.bind(this, word)}
              />,
              container
            );
          })
        }
      </div>
    );
  }

  public learnerDefinitionUpdated = (word: string, newDefinition: string) => {
    const { PluginAPI, pluginId } = this.props;
    const { learnerState } = this.state;
    // Make sure that reference is updated, so React can detect changes. ImmutableJS could be helpful.
    const newLearnerState = Object.assign({}, learnerState);
    if (!newLearnerState.definitions[word]) {
      newLearnerState.definitions[word] = [];
    }
    newLearnerState.definitions[word] = newLearnerState.definitions[word].concat(newDefinition);
    this.setState({ learnerState: newLearnerState });
    PluginAPI.saveLearnerPluginState(pluginId, JSON.stringify(newLearnerState));
  }

  private decorate() {
    const { definitions, PluginAPI } = this.props;
    const words = definitions.map(entry => entry.word);
    const replace = `<span class="${css.ccGlossaryWord}">$1</span>`;
    const listener = {
      type: "click",
      listener: this.wordClicked
    };
    PluginAPI.decorateContent(words, replace, css.ccGlossaryWord, [listener]);
  }

  private addSidebar() {
    const { PluginAPI } = this.props;
    this.sidebarContainer = document.createElement("div");
    // This is important for sidebar UI. Max height enables scrolling of the definitions container.
    // Exact value is inherited from the container provided by LARA.
    this.sidebarContainer.style.maxHeight = "inherit";
    this.sidebarIconContainer = document.createElement("div");
    this.sidebarController = PluginAPI.addSidebar({
      handle: "Glossary",
      titleBar: "Glossary",
      titleBarColor: "#bbb",
      handleColor: "#777",
      width: 450,
      height: 500,
      icon: this.sidebarIconContainer,
      content: this.sidebarContainer,
      onOpen: this.sidebarOpened
    });
    // Let now React that it should actually render Sidebar UI components.
    this.setState({ sidebarPresent: true });
  }

  private sidebarOpened = () => {
    // Close all the popups.
    const { openPopups } = this.state;
    openPopups.forEach((desc: IOpenPopupDesc) => {
      desc.popupController.close();
    });
  }

  private wordClicked = (evt: Event) => {
    const { PluginAPI } = this.props;
    const wordElement = evt.srcElement;
    const word = (wordElement && wordElement.textContent || "").toLowerCase();
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
      onClose: this.popupClosed.bind(this, container)
    });
    const newOpenPopups = openPopups.concat({ word, container, popupController });
    this.setState({ openPopups: newOpenPopups });
    // Finally, close sidebar in case it's available and open.
    if (this.sidebarController) {
      this.sidebarController.close();
    }
  }

  private popupClosed(container: HTMLElement) {
    // Keep state in sync. Popup can be closed using X sign in LARA. We don't control that.
    // Remove popup from list of opened popups. It will also ensure that Popup component will unmount correctly.
    const { openPopups } = this.state;
    const newOpenPopups = openPopups.filter((desc: IOpenPopupDesc) => desc.container !== container);
    this.setState({ openPopups: newOpenPopups });
  }
}
