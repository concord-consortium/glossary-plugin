import * as React from "react";
import Definition from "./definition";
import UserDefinitions from "./user-definitions";
import Button from "../common/button";
import { POEDITOR_LANG_NAME } from "../../utils/poeditor-language-list";
import { pluginContext } from "../../plugin-context";
import { wordTerm } from "../../utils/translation-utils";

import * as css from "./glossary-popup.scss";
import TextToSpeech from "./text-to-speech";

interface IProps {
  word: string;
  definition: string;
  userDefinitions?: string[];
  askForUserDefinition?: boolean;
  autoShowMedia?: boolean;
  onUserDefinitionsUpdate?: (userDefinitions: string) => void;
  imageUrl?: string;
  videoUrl?: string;
  imageCaption?: string;
  videoCaption?: string;
  secondLanguage?: string;
  onLanguageChange?: () => void;
}

interface IState {
  currentUserDefinition: string;
  questionVisible: boolean;
}

export default class GlossaryPopup extends React.Component<IProps, IState> {
  public static contextType = pluginContext;

  public state: IState = {
    currentUserDefinition: "",
    questionVisible: this.props.askForUserDefinition || false
  };

  public get mainPrompt() {
    const { word } = this.props;
    const i18n = this.context;
    const translatedWord = i18n.translate(wordTerm(word), word);
    return i18n.translate("mainPrompt", null, { word: translatedWord, wordInEnglish: word });
  }

  public get answerPlaceholder() {
    const { userDefinitions } = this.props;
    const i18n = this.context;
    const anyUserDef = userDefinitions && userDefinitions.length > 0;
    return anyUserDef ? i18n.translate("writeNewDefinition") : i18n.translate("writeDefinition");
  }

  public render() {
    const { questionVisible } = this.state;
    const { secondLanguage, onLanguageChange } = this.props;
    return (
      <div className={css.glossaryPopup}>
        {
          secondLanguage && onLanguageChange &&
          <Button
            data-cy="langToggle"
            className={css.langButton}
            label={POEDITOR_LANG_NAME[secondLanguage].replace("_", " ")}
            onClick={onLanguageChange}
          />
        }
        {questionVisible ? this.renderQuestion() : this.renderDefinition()}
      </div>
    );
  }

  private renderDefinition() {
    const { askForUserDefinition, autoShowMedia, definition, userDefinitions, imageUrl,
      videoUrl, imageCaption, videoCaption, word } = this.props;
    const i18n = this.context;
    return (
      <div>
        <Definition
          word={word}
          definition={definition}
          imageUrl={imageUrl}
          videoUrl={videoUrl}
          imageCaption={imageCaption}
          videoCaption={videoCaption}
          autoShowMedia={autoShowMedia}
        />
        {
          askForUserDefinition && userDefinitions && userDefinitions.length > 0 &&
          <div className={css.userDefs}>
            <hr />
            <UserDefinitions userDefinitions={userDefinitions} />
            <div className={css.buttons}>
              <div className={css.button} data-cy="revise" onClick={this.handleRevise}>
                {i18n.translate("revise")}
              </div>
            </div>
          </div>
        }
      </div>
    );
  }

  private renderQuestion() {
    const { word, userDefinitions, imageUrl, videoUrl, autoShowMedia } = this.props;
    const { currentUserDefinition } = this.state;
    const i18n = this.context;
    const anyUserDef = userDefinitions && userDefinitions.length > 0;
    return (
      <div>
        {
          autoShowMedia && imageUrl &&
          <div className={css.imageContainer}>
            <img src={imageUrl} />
          </div>
        }
        {
          autoShowMedia && !imageUrl && videoUrl &&
          <div className={css.imageContainer}>
            <video src={videoUrl} controls={true}/>
          </div>
        }
        {this.mainPrompt}
        <TextToSpeech text={this.mainPrompt} word={word} textType="main prompt" />
        <div className={css.answerTextarea}>
          <textarea
            className={css.userDefinitionTextarea}
            placeholder={this.answerPlaceholder}
            onChange={this.handleTextareaChange}
            value={currentUserDefinition}
          />
          {
            !currentUserDefinition &&
            <TextToSpeech text={this.answerPlaceholder} word={word} textType="answer placeholder" />
          }
        </div>
        {
          // If user already provided some answer, display them below.
          userDefinitions && userDefinitions.length > 0 &&
          <div className={css.userDefs}>
            <UserDefinitions userDefinitions={userDefinitions} />
          </div>
        }
        <div className={css.buttons}>
          <div className={css.button} data-cy="submit" onClick={this.handleSubmit}>
            {i18n.translate("submit")}
          </div>
          {/* Button is different depending whether user sees the question for the fist time or not */}
          <div
            className={css.button}
            data-cy="cancel"
            onClick={anyUserDef ? this.handleCancel : this.handleIDontKnow}
          >
            {anyUserDef ? i18n.translate("cancel") : i18n.translate("iDontKnowYet")}
          </div>
        </div>
      </div>
    );
  }

  private addUserDefinition = (userDefinition: string) => {
    this.setState({
      questionVisible: false
    });
    if (this.props.onUserDefinitionsUpdate) {
      this.props.onUserDefinitionsUpdate(userDefinition);
    }
  }

  private handleTextareaChange = (evt: any) => {
    this.setState({ currentUserDefinition: evt.target.value });
  }

  private handleSubmit = () => {
    const { currentUserDefinition } = this.state;
    this.addUserDefinition(currentUserDefinition);
  }

  private handleIDontKnow = () => {
    this.addUserDefinition("I don't know yet");
  }

  private handleCancel = () => {
    this.setState({ questionVisible: false });
  }

  private handleRevise = () => {
    this.setState({ questionVisible: true });
  }
}
