import * as React from "react";
import * as ReactDOM from "react-dom";
import GlossaryPopup from "./glossary-popup";
import GlossarySidebar from "./glossary-sidebar";
import { IWordDefinition, ILearnerDefinitions, ITranslation, IStudentInfo } from "../../types";
import * as PluginAPI from "@concord-consortium/lara-plugin-api";
import { UI_TRANSLATIONS, DEFAULT_LANG, replaceVariables,  } from "../../i18n-context";
import { pluginContext } from "../../plugin-context";
import { watchStudentSettings, saveLogEvent } from "../../db";
import { ILogEvent, ILogEventPartial } from "../../types";
import { IGlossaryAuthoredState } from "../authoring/authoring-app";
import * as pluralize from "pluralize";

import * as css from "./plugin-app.scss";
import * as icons from "../common/icons.scss";
import { POEDITOR_LANG_NAME } from "../../utils/poeditor-language-list";

export interface IPluginEvent {
  type: string;
  text: string;
}

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
  enableStudentRecording: boolean;
  showSideBar: boolean;
  translations: {
    [languageCode: string]: ITranslation
  };
  studentInfo?: IStudentInfo;
  glossaryInfo?: IGlossaryAuthoredState;
  resourceUrl?: string;
  laraLog?: (event: string | PluginAPI.ILogData) => void;
}

export interface IDefinitionsByWord {
  [word: string]: IWordDefinition;
}

interface IState {
  openPopups: IOpenPopupDesc[];
  learnerState: ILearnerState;
  sidebarPresent: boolean;
  lang: string;
  secondLanguage?: string;
  definitionsByWord: IDefinitionsByWord;
  enableStudentRecording: boolean;
}

export default class PluginApp extends React.Component<IProps, IState> {
  public state: IState = {
    openPopups: [],
    learnerState: this.props.initialLearnerState,
    sidebarPresent: false,
    lang: "en",
    secondLanguage: undefined,
    definitionsByWord: {},
    enableStudentRecording: false
  };
  private sidebarContainer: HTMLElement;
  private sidebarIconContainer: HTMLElement;
  private sidebarController: ISidebarController;

  get secondLanguage() {
    const { lang, secondLanguage } = this.state;
    if (!secondLanguage) {
      return undefined;
    }
    // Depending on the current state, we should either let student switch to a second language,
    // or go back to the default one.
    return lang !== secondLanguage ? secondLanguage : DEFAULT_LANG;
  }

  public componentDidMount() {
    const {definitionsByWord} = this.state;
    const { showSideBar, studentInfo, definitions } = this.props;
    definitions.forEach(entry => {
      const word = entry.word.toLowerCase();
      definitionsByWord[word] = entry;
      if (pluralize.isSingular(word)) {
        const pluralWord = pluralize.plural(word);
        if (pluralWord !== word) {
          definitionsByWord[pluralWord] = entry;
        }
      }
    });
    if (definitions.length === 0) {
      // Nothing to do.
      return;
    }
    this.setState({definitionsByWord}, () => {
      this.decorate();
      if (showSideBar) {
        this.addSidebar();
      }
      if (studentInfo) {
        watchStudentSettings(studentInfo.source, studentInfo.contextId, studentInfo.userId, (settings => {
          const { translations } = this.props;
          if (translations[settings.preferredLanguage]) {
            // Preferred language is available, so we can use it.
            this.setState({ secondLanguage: settings.preferredLanguage });
          } else {
            // Preferred language is not available, do not show second language button.
            this.setState({ lang: DEFAULT_LANG, secondLanguage: undefined });
          }

          // add per-student recording toggle
          this.setState({enableStudentRecording: settings.enableRecording});
        }));

        this.log({
          event: "plugin init"
        });
      }
    });
  }

  public render() {
    const { askForUserDefinition, autoShowMediaInPopup, definitions, studentInfo } = this.props;
    const { openPopups, learnerState, sidebarPresent, lang, definitionsByWord } = this.state;
    // student recording is enabled per student with the combination of it being enabled by the glossary
    // author along with it being enabled by the teacher in the dashboard per student
    const enableStudentRecording = this.props.enableStudentRecording && this.state.enableStudentRecording;

    // Note that returned div will be empty in fact. We render only into React Portals.
    // It's possible to return array instead, but it seems to cause some cryptic errors in tests.
    return (
      <pluginContext.Provider value={{ lang, translate: this.translate, log: this.log }} >
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
                  definition={definitionsByWord[word].definition}
                  imageUrl={definitionsByWord[word].image}
                  zoomImageUrl={definitionsByWord[word].zoomImage}
                  videoUrl={definitionsByWord[word].video}
                  imageCaption={definitionsByWord[word].imageCaption}
                  videoCaption={definitionsByWord[word].videoCaption}
                  userDefinitions={learnerState.definitions[word]}
                  askForUserDefinition={askForUserDefinition}
                  autoShowMedia={autoShowMediaInPopup}
                  enableStudentRecording={enableStudentRecording}
                  onUserDefinitionsUpdate={this.learnerDefinitionUpdated.bind(this, word)}
                  secondLanguage={this.secondLanguage}
                  onLanguageChange={this.languageChanged}
                  studentInfo={studentInfo}
                />,
                container
              );
            })
          }
        </div>
      </pluginContext.Provider>
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
    this.log({
      event: "definition saved",
      word,
      definition: newDefinition,
      definitions: newLearnerState.definitions[word]
    });
  }

  public translate = (key: string, fallback: string | null = null, variables: {[key: string]: string} = {}) => {
    const { translations } = this.props;
    const { lang } = this.state;
    // Note that `translations` consist of authored translations like terms or image captions.
    // UI translations consists of UI elements translations that are built into the app.
    // It's okay mix these two, as keys are distinct and actually authors might want to customize translations
    // of some UI elements or prompts.
    const result = translations[lang] && translations[lang][key] ||
      translations[DEFAULT_LANG] && translations[DEFAULT_LANG][key] ||
      UI_TRANSLATIONS[lang] && UI_TRANSLATIONS[lang][key] ||
      UI_TRANSLATIONS[DEFAULT_LANG] && UI_TRANSLATIONS[DEFAULT_LANG][key] ||
      fallback;
    if (!result) {
      return result;
    }
    return replaceVariables(result, variables);
  }

  public log = (event: ILogEventPartial) => {
    const { studentInfo, glossaryInfo, laraLog, resourceUrl } = this.props;
    if (!studentInfo || !glossaryInfo || !resourceUrl) {
      // User not coming from Portal.
      return;
    }
    const completeEvent: ILogEvent = Object.assign({}, event, {
      userId: studentInfo.userId,
      contextId: studentInfo.contextId,
      resourceUrl,
      glossaryUrl: glossaryInfo.s3Url!,
      glossaryResourceId: glossaryInfo.glossaryResourceId!,
      timestamp: Date.now()
    });
    saveLogEvent(studentInfo.source, studentInfo.contextId, completeEvent);
    if (laraLog) {
      laraLog(completeEvent);
    }
  }

  private decorate() {
    const words = Object.keys(this.state.definitionsByWord);
    const replace = `<span class="${css.ccGlossaryWord}" style="text-decoration:underline; cursor:pointer;">$1</span>`;
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

  private wordClicked = (evt: Event | IPluginEvent) => {
    const {definitionsByWord} = this.state;
    const wordElement = "srcElement" in evt ? evt.srcElement as HTMLElement : undefined;
    const pluginEventWord = "text" in evt ? evt.text : "";
    const clickedWord = wordElement
                        ? (wordElement.textContent || "").toLowerCase()
                        : pluginEventWord.toLowerCase();
    if (!definitionsByWord[clickedWord]) {
      // Ignore, nothing to do.
      return;
    }
    // get singular version of the word if plural
    const word = definitionsByWord[clickedWord].word;
    const { openPopups } = this.state;

    // ensure that the popup isn't already open
    const popupOpen = !!openPopups.find((openPopup) => openPopup.word === word);
    if (!popupOpen) {
      const container = document.createElement("div");
      const popupController = PluginAPI.addPopup({
        content: container,
        title: `Term: ${word}`,
        resizable: false,
        position: wordElement
                  ? { my: "left top+10", at: "left bottom", of: wordElement, collision: "flip" }
                  : undefined,
        onClose: this.popupClosed.bind(this, container)
      } );
      const newOpenPopups = openPopups.concat({ word, container, popupController });
      this.setState({ openPopups: newOpenPopups });
      // Finally, close sidebar in case it's available and open.
      if (this.sidebarController) {
        this.sidebarController.close();
      }
    }
    this.log({
      event: "term clicked",
      word,
      clickedWord,
      popupState: popupOpen ? "already open" : "opening"
    });
  }

  private popupClosed(container: HTMLElement) {
    // Keep state in sync. Popup can be closed using X sign in LARA. We don't control that.
    // Remove popup from list of opened popups. It will also ensure that Popup component will unmount correctly.
    const { openPopups } = this.state;
    const newOpenPopups = openPopups.filter((desc: IOpenPopupDesc) => desc.container !== container);
    this.setState({ openPopups: newOpenPopups });
  }

  private languageChanged = () => {
    const { lang } = this.state;
    const secLang = this.secondLanguage;
    if (secLang) {
      this.setState({ lang: secLang });
      this.log({
        event: "language changed",
        previousLanguage: POEDITOR_LANG_NAME[lang].replace("_", " "),
        newLanguage: POEDITOR_LANG_NAME[secLang].replace("_", " ")
      });
    }
  }
}
