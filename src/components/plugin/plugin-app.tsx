import * as React from "react";
import * as ReactDOM from "react-dom";
import GlossaryPopup from "./glossary-popup";
import GlossarySidebar from "./glossary-sidebar";
import { IWordDefinition, ILearnerDefinitions, ITranslation, IStudentInfo } from "../../types";
import * as PluginAPI from "@concord-consortium/lara-plugin-api";
import { DEFAULT_LANG, translate } from "../../i18n-context";
import { pluginContext } from "../../plugin-context";
import { watchStudentSettings, sendLogEventToFirestore } from "../../db";
import { ILogEvent, ILogEventPartial } from "../../types";
import { IGlossaryAuthoredState } from "../authoring/authoring-app";
import * as pluralize from "pluralize";
import { POEDITOR_LANG_NAME } from "../../utils/poeditor-language-list";
import { saveLogEventInIndexDB, OfflineStorageTBDMarker } from "./offline-storage";
import { ILanguage } from "./language-selector";

import * as css from "./plugin-app.scss";
import * as icons from "../common/icons.scss";

export interface IPluginEvent {
  type: string;
  text: string;
  bounds?: DOMRect;
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
  enableStudentLanguageSwitching: boolean;
  disableReadAloud: boolean;
  showSideBar: boolean;
  translations: {
    [languageCode: string]: ITranslation
  };
  studentInfo?: IStudentInfo;
  glossaryInfo?: IGlossaryAuthoredState;
  resourceUrl?: string;
  laraLog?: (event: string | PluginAPI.ILogData) => void;
  offlineMode: boolean;
  showIDontKnowButton: boolean;
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
  otherLanguages: string[];
  definitionsByWord: IDefinitionsByWord;
}

export default class PluginApp extends React.Component<IProps, IState> {
  public state: IState = {
    openPopups: [],
    learnerState: this.props.initialLearnerState,
    sidebarPresent: false,
    lang: DEFAULT_LANG,
    secondLanguage: undefined,
    otherLanguages: [],
    definitionsByWord: {}
  };
  private sidebarContainer: HTMLElement;
  private sidebarIconContainer: HTMLElement;
  private sidebarController: ISidebarController;

  get languages(): ILanguage[] {
    const { lang, secondLanguage } = this.state;
    const { translations, enableStudentLanguageSwitching } = this.props;
    let langs: string[] = [];

    if (enableStudentLanguageSwitching) {
      langs = Object.keys(translations);
      if (langs.length > 0) {
        // add the default language to the translations
        langs.unshift(DEFAULT_LANG);
      }
    } else if (secondLanguage) {
      langs = [DEFAULT_LANG, secondLanguage];
    }

    return langs.map<ILanguage>(langItem => ({lang: langItem, selected: langItem === lang}));
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
          const { preferredLanguage } = settings;

          // ensure the second language set by the teacher is available in the translations before setting
          // and add per-student recording toggle set by the teacher
          this.setState({
            lang: DEFAULT_LANG,
            secondLanguage: translations[preferredLanguage] ? preferredLanguage : undefined
           });
        }));
      }

      this.log({
        event: "plugin init"
      });
    });
  }

  public render() {
    const { askForUserDefinition, autoShowMediaInPopup, definitions, studentInfo, disableReadAloud, showIDontKnowButton, enableStudentRecording } = this.props;
    const { openPopups, learnerState, sidebarPresent, lang, definitionsByWord } = this.state;

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
                languages={this.languages}
                onLanguageChange={this.languageChanged}
                disableReadAloud={disableReadAloud}
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
              const glossaryItem = definitionsByWord[word.toLowerCase()];
              return ReactDOM.createPortal(
                <GlossaryPopup
                  word={word}
                  definition={glossaryItem.definition}
                  imageUrl={glossaryItem.image}
                  zoomImageUrl={glossaryItem.zoomImage}
                  videoUrl={glossaryItem.video}
                  imageCaption={glossaryItem.imageCaption}
                  imageAltText={glossaryItem.imageAltText}
                  videoCaption={glossaryItem.videoCaption}
                  videoAltText={glossaryItem.videoAltText}
                  closedCaptionsUrl={glossaryItem.closedCaptionsUrl}
                  userDefinitions={learnerState.definitions[word]}
                  askForUserDefinition={askForUserDefinition}
                  autoShowMedia={autoShowMediaInPopup}
                  enableStudentRecording={enableStudentRecording}
                  onUserDefinitionsUpdate={this.learnerDefinitionUpdated.bind(this, word)}
                  languages={this.languages}
                  onLanguageChange={this.languageChanged}
                  studentInfo={studentInfo}
                  disableReadAloud={disableReadAloud}
                  showIDontKnowButton={showIDontKnowButton}
                  diggingDeeper={glossaryItem.diggingDeeper}
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
    return translate(this.props.translations, this.state.lang, key, fallback, variables);
  }

  public log = (event: ILogEventPartial) => {
    const { studentInfo, glossaryInfo, laraLog, resourceUrl, offlineMode } = this.props;
    if (!glossaryInfo || !resourceUrl) {
      // can't log anything without this information
      return;
    }
    // studentInfo will be undefined in offline mode when not launched from the portal
    const { contextId, userId } = studentInfo
      ? studentInfo
      : { contextId: OfflineStorageTBDMarker, userId: OfflineStorageTBDMarker };
    const completeEvent: ILogEvent = Object.assign({}, event, {
      userId,
      contextId,
      resourceUrl,
      glossaryUrl: glossaryInfo.s3Url!,
      glossaryResourceId: glossaryInfo.glossaryResourceId!,
      timestamp: Date.now()
    });
    if (offlineMode) {
      saveLogEventInIndexDB(completeEvent);
    } else if (studentInfo) {
      sendLogEventToFirestore(studentInfo.source, studentInfo.contextId, completeEvent);
    }
    if (laraLog) {
      laraLog(completeEvent);
    }
  }

  private decorate() {
    const words = Object.keys(this.state.definitionsByWord);
    // inline style is used so uniform style can be applied to text decoration inside iframes
    // leave the CSS class for now, but this might become obsolete in the future
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
                  : undefined, // no srcElement from the evt argument, use undefined to position in screen center
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

  private languageChanged = (newLang: string) => {
    const { lang } = this.state;
    this.setState({ lang: newLang });
    this.log({
      event: "language changed",
      previousLanguage: POEDITOR_LANG_NAME[lang].replace("_", " "),
      newLanguage: POEDITOR_LANG_NAME[newLang].replace("_", " "),
      previousLanguageCode: lang,
      newLanguageCode: newLang
    });
  }
}
