import * as React from "react";
import * as ReactDOM from "react-dom";
import GlossaryPopup from "./glossary-popup";
import GlossarySidebar from "./glossary-sidebar";
import { IWordDefinition, ILearnerDefinitions, ITranslation } from "./types";
import * as PluginAPI from "@concord-consortium/lara-plugin-api";
import { i18nContext } from "../i18n-context";

import * as css from "./plugin-app.scss";
import * as icons from "./icons.scss";

const DEFAULT_LANG = "en";

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
  saveState: (state: string) => any;
  definitions: IWordDefinition[];
  initialLearnerState: ILearnerState;
  askForUserDefinition: boolean;
  autoShowMediaInPopup: boolean;
  showSideBar: boolean;
  translations: {
    [languageCode: string]: ITranslation
  };
}

interface IState {
  openPopups: IOpenPopupDesc[];
  learnerState: ILearnerState;
  sidebarPresent: boolean;
  lang: string;
}

export default class PluginApp extends React.Component<IProps, IState> {
  public state: IState = {
    openPopups: [],
    learnerState: this.props.initialLearnerState,
    sidebarPresent: false,
    lang: "en"
  };
  private definitionsByWord: { [word: string]: IWordDefinition };
  private sidebarContainer: HTMLElement;
  private sidebarIconContainer: HTMLElement;
  private sidebarController: ISidebarController;

  get secondLanguage() {
    // Currently we pick the first available language as a second one. In the future, this information will be provided
    // by LARA/Portal in some other way (e.g. through Plugin API).
    const { translations } = this.props;
    const { lang } = this.state;
    return lang === DEFAULT_LANG ? Object.keys(translations)[0] : DEFAULT_LANG;
  }

  public componentDidMount() {
    const { definitions, showSideBar } = this.props;
    this.definitionsByWord = {};
    definitions.forEach(entry => {
      this.definitionsByWord[entry.word.toLowerCase()] = entry;
    });
    if (definitions.length === 0) {
      // Nothing to do.
      return;
    }
    this.decorate();
    if (showSideBar) {
      this.addSidebar();
    }
  }

  public render() {
    const { askForUserDefinition, autoShowMediaInPopup, definitions } = this.props;
    const { openPopups, learnerState, sidebarPresent, lang } = this.state;
    // Note that returned div will be empty in fact. We render only into React Portals.
    // It's possible to return array instead, but it seems to cause some cryptic errors in tests.
    return (
      <i18nContext.Provider value={{translate: this.translate }}>
        <div>
          {
            // Render sidebar into portal.
            // Do not render user definitions if askForUserDefinition mode is disabled.
            // Note that they might be available if previously this mode was enabled.
            sidebarPresent && ReactDOM.createPortal(
              <GlossarySidebar
                definitions={definitions}
                learnerDefinitions={askForUserDefinition ? learnerState.definitions : {}}
                secondLanguage={this.secondLanguage}
                onLanguageChange={this.languageChanged}
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
                  autoShowMedia={autoShowMediaInPopup}
                  onUserDefinitionsUpdate={this.learnerDefinitionUpdated.bind(this, word)}
                  secondLanguage={this.secondLanguage}
                  onLanguageChange={this.languageChanged}
                />,
                container
              );
            })
          }
        </div>
      </i18nContext.Provider>
    );
  }

  public learnerDefinitionUpdated = (word: string, newDefinition: string) => {
    const { saveState } = this.props;
    const { learnerState } = this.state;
    // Make sure that reference is updated, so React can detect changes. ImmutableJS could be helpful.
    const newLearnerState = Object.assign({}, learnerState);
    if (!newLearnerState.definitions[word]) {
      newLearnerState.definitions[word] = [];
    }
    newLearnerState.definitions[word] = newLearnerState.definitions[word].concat(newDefinition);
    this.setState({ learnerState: newLearnerState });
    saveState(JSON.stringify(newLearnerState));
  }

  private decorate() {
    const { definitions } = this.props;
    const words = definitions.map(entry => entry.word);
    const replace = `<span class="${css.ccGlossaryWord}">$1</span>`;
    const listener = {
      type: "click",
      listener: this.wordClicked
    };
    PluginAPI.decorateContent(words, replace, css.ccGlossaryWord, [listener]);
  }

  private addSidebar() {
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
      padding: 0,
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
    const wordElement = evt.srcElement as HTMLElement;
    if (!wordElement) {
      return;
    }
    const word = (wordElement.textContent || "").toLowerCase();
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
    } );
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

  private languageChanged = () => {
    this.setState({ lang: this.secondLanguage });
  }

  private translate = (key: string, fallback: string | null = null) => {
    const { translations } = this.props;
    const { lang } = this.state;
    return translations[lang] && translations[lang][key] || fallback;
  }
}
