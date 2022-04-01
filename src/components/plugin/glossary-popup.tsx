import * as React from "react";
import Definition from "./definition";
import UserDefinitions from "./user-definitions";
import Button from "../common/button";
import { POEDITOR_LANG_NAME } from "../../utils/poeditor-language-list";
import { pluginContext } from "../../plugin-context";
import { TextKey, term } from "../../utils/translation-utils";
import { uploadRecording } from "../../db";
import RecordProgress from "./record-progress";
import Image from "./image";
import TextToSpeech from "./text-to-speech";
import { IStudentInfo } from "../../types";
import { isAudioUrl, getAudio, isAudioOrRecordingUrl } from "../../utils/audio";
import LanguageSelector, { ILanguage } from "./language-selector";

import * as icons from "../common/icons.scss";
import * as css from "./glossary-popup.scss";

export const RECORDING_TIMEOUT = 60 * 1000;

enum RecordingState {
  NotRecording,
  Recording,
  AwaitingSubmit,
  SavingRecording
}

interface IProps {
  word: string;
  definition: string;
  userDefinitions?: string[];
  askForUserDefinition?: boolean;
  enableStudentRecording?: boolean;
  autoShowMedia?: boolean;
  onUserDefinitionsUpdate?: (userDefinitions: string) => void;
  imageUrl?: string;
  zoomImageUrl?: string;
  videoUrl?: string;
  imageCaption?: string;
  videoCaption?: string;
  languages?: ILanguage[];
  onLanguageChange?: (newLang: string) => void;
  studentInfo?: IStudentInfo;
  demoMode?: boolean;
}

interface IState {
  currentUserDefinition: string;
  questionVisible: boolean;
  canRecord: boolean;
  recordingState: RecordingState;
  recordingStartTime: number;
  errorSavingRecording: boolean;
}

export default class GlossaryPopup extends React.Component<IProps, IState> {
  public static contextType = pluginContext;

  public state: IState = {
    currentUserDefinition: "",
    questionVisible: this.props.askForUserDefinition || false,
    canRecord: this.canRecord(this.props),
    recordingState: RecordingState.NotRecording,
    recordingStartTime: 0,
    errorSavingRecording: false
  };

  private mediaRecorder: MediaRecorder | null = null;
  private recordedBlobs: Blob[] = [];
  private audio: HTMLAudioElement | null = null;
  private recordingTimeout: number;

  public UNSAFE_componentWillReceiveProps(nextProps: IProps) {
    // teacher may change the recording option in their dashboard while popup is visible for student
    this.setState({canRecord: this.canRecord(nextProps)});
  }

  public get mainPrompt() {
    const { word } = this.props;
    const i18n = this.context;
    const translatedWord = i18n.translate(term[TextKey.Word](word), word);
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
    const { languages, onLanguageChange } = this.props;
    return (
      <div className={css.glossaryPopup}>
        <LanguageSelector
          languages={languages}
          onLanguageChange={onLanguageChange}
        />
        {questionVisible ? this.renderQuestion() : this.renderDefinition()}
      </div>
    );
  }

  private renderDefinition() {
    const { askForUserDefinition, autoShowMedia, definition, userDefinitions, imageUrl, zoomImageUrl,
      videoUrl, imageCaption, videoCaption, word } = this.props;
    const i18n = this.context;
    /*
      this code:

      <div className={css.buttons}>
        <div className={css.button} data-cy="revise" onClick={this.handleRevise}>
          {i18n.translate("revise")}
        </div>
      </div>

      followed:

      <UserDefinitions ... />

      We are removing it for now to keep students from immediately revising their definitions
      using the supplied definition.
    */
    return (
      <div>
        <Definition
          word={word}
          definition={definition}
          imageUrl={imageUrl}
          zoomImageUrl={zoomImageUrl}
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
          </div>
        }
      </div>
    );
  }

  private renderQuestion() {
    const { word, userDefinitions, imageUrl, zoomImageUrl, imageCaption, definition,
            videoUrl, autoShowMedia } = this.props;
    const { currentUserDefinition, recordingState } = this.state;
    const recording = recordingState !== RecordingState.NotRecording;
    const canSubmit = recordingState !== RecordingState.Recording;
    const i18n = this.context;
    const anyUserDef = userDefinitions && userDefinitions.length > 0;
    return (
      <div>
        {
          autoShowMedia && imageUrl &&
          <Image
            word={word}
            definition={definition}
            imageUrl={imageUrl}
            zoomImageUrl={zoomImageUrl}
            imageCaption={imageCaption}
          />
        }
        {
          autoShowMedia && !imageUrl && videoUrl &&
          <div className={css.imageContainer}>
            <video src={videoUrl} controls={true}/>
          </div>
        }
        {this.mainPrompt}
        <TextToSpeech text={this.mainPrompt} word={word} textKey={TextKey.MainPrompt} />
        <div className={css.answerTextarea}>
          {recording && this.renderRecording()}
          {!recording &&
            <>
              <textarea
                className={css.userDefinitionTextarea}
                placeholder={this.answerPlaceholder}
                onChange={this.handleTextareaChange}
                value={currentUserDefinition}
              />
              {this.renderQuestionIcons()}
            </>
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
          <div
            className={`${css.button} ${canSubmit ? "" : css.disabled}`}
            data-cy="submit"
            onClick={canSubmit ? this.handleSubmit : undefined}
          >
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

  private renderRecording() {
    const { userDefinitions } = this.props;
    const { recordingState, recordingStartTime, errorSavingRecording } = this.state;
    const i18n = this.context;
    const className = recordingState === RecordingState.Recording ? css.recording : css.recorded;
    let recordingContents: JSX.Element | null = null;

    switch (recordingState) {
      case RecordingState.NotRecording:
        // should not get here as call to render function is guarded with test of recordingState
        return null;

      case RecordingState.Recording:
        recordingContents = (
          <>
            {i18n.translate("recording")} …
            <div className={css.recordingIcons}>
              <RecordProgress
                startTime={recordingStartTime}
                maxDuration={RECORDING_TIMEOUT}
                onClick={this.handleStopRecording}
                title={i18n.translate("stopRecording")}
              >
                <span className={icons.iconButton + " " + icons.iconStop} />
              </RecordProgress>
            </div>
          </>
        );
        break;

      case RecordingState.AwaitingSubmit:
        const recordingIndex = (userDefinitions ? userDefinitions.filter(isAudioOrRecordingUrl) : []).length + 1;
        recordingContents = (
          <>
            {i18n.translate("audioDefinition", "Audio definition %{index}", {index: recordingIndex})}
            <div className={css.recordedIcons}>
              <span
                data-cy={`playRecording${recordingIndex}`}
                className={icons.iconButton + " " + icons.iconAudio}
                onClick={this.handlePlayRecording}
                title={i18n.translate("playRecording")}
              />
              <span
                data-cy={`deleteRecording${recordingIndex}`}
                className={icons.iconButton + " " + icons.iconDeleteAudio}
                onClick={this.handleDeleteRecording}
                title={i18n.translate("deleteRecording")}
              />
            </div>
            {errorSavingRecording
              ? <div className={css.recordingSaveError}>{i18n.translate("errorSavingRecording")}</div>
              : undefined}
          </>
        );
        break;

      case RecordingState.SavingRecording:
        recordingContents = (
          <>
            {i18n.translate("savingRecording")} …
          </>
        );
        break;
    }

    return (
      <div className={className}>
        {recordingContents}
      </div>
    );
  }

  private renderQuestionIcons() {
    const { word } = this.props;
    const { currentUserDefinition, canRecord } = this.state;
    const i18n = this.context;
    if (!currentUserDefinition) {
      return (
        <div className={css.answerTextareaIcons}>
          <TextToSpeech text={this.answerPlaceholder} word={word} textKey={TextKey.WriteDefinition} />
          {canRecord && <span
            data-cy="recordButton"
            className={icons.iconButton + " " + icons.iconRecord}
            onClick={this.handleStartRecording}
            title={i18n.translate("record")}
          />}
        </div>
      );
    }
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

  private handleSubmit = async () => {
    const { currentUserDefinition, recordingState } = this.state;
    const { studentInfo, demoMode } = this.props;
    if ((recordingState === RecordingState.AwaitingSubmit) && isAudioUrl(currentUserDefinition)) {
      this.setState({errorSavingRecording: false});
      this.updateRecording({nextState: RecordingState.SavingRecording, clearRecording: false });
      try {
        this.context.log({event: "submitting recording"});
        const uploadedUrl = await uploadRecording({
          audioBlobUrl: currentUserDefinition,
          studentInfo,
          demoMode
        });
        this.context.log({event: "submitted recording"});
        if (this.props.onUserDefinitionsUpdate) {
          this.props.onUserDefinitionsUpdate(uploadedUrl);
        }
        this.updateRecording({nextState: RecordingState.NotRecording, clearRecording: true});
      } catch (err) {
        // tslint:disable-next-line:no-console
        console.error(err.toString());
        this.context.log({
          event: "error submitting recording",
          error: err.toString()
        });
        this.setState({errorSavingRecording: true});
        this.updateRecording({nextState: RecordingState.AwaitingSubmit, clearRecording: false });
      }
    } else {
      this.addUserDefinition(currentUserDefinition);
    }
  }

  private handleIDontKnow = () => {
    const i18n = this.context;
    this.updateRecording({nextState: RecordingState.NotRecording, clearRecording: true});
    this.addUserDefinition(i18n.translate("iDontKnowYet"));
  }

  private handleCancel = () => {
    this.updateRecording({nextState: RecordingState.NotRecording, clearRecording: true});
    this.setState({ questionVisible: false, errorSavingRecording: false });
  }

  private handleRevise = () => {
    this.setState({ questionVisible: true, errorSavingRecording: false });
  }

  private updateRecording(options: {nextState: RecordingState, clearRecording: boolean}) {
    let {currentUserDefinition, recordingStartTime} = this.state;
    const {nextState, clearRecording} = options;
    if (this.mediaRecorder) {
      this.mediaRecorder.ondataavailable = null;
      this.mediaRecorder.onstop = null;
      this.mediaRecorder.stop();
    }
    this.mediaRecorder = null;
    this.audio = null;
    this.recordedBlobs = [];
    if (clearRecording) {
      currentUserDefinition = "";
    }
    if (nextState === RecordingState.Recording) {
      recordingStartTime = Date.now();
    }
    this.setState({currentUserDefinition, recordingState: nextState, recordingStartTime});
  }

  private handleStartRecording = () => {
    const i18n = this.context;
    let showRecordingTimeLimitReached = false;

    clearTimeout(this.recordingTimeout);
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        this.updateRecording({nextState: RecordingState.Recording, clearRecording: true});
        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.ondataavailable = (event) => {
          this.recordedBlobs.push(event.data);
        };
        const {mimeType} = this.mediaRecorder;
        this.mediaRecorder.onstop = () => {
          this.context.log({event: "stopped recording"});
          this.mediaRecorder = null;
          const recording = new Blob(this.recordedBlobs, {type: mimeType});
          const reader = new FileReader();
          reader.onload = async () => {
            if (!reader.result) {
              this.updateRecording({nextState: RecordingState.NotRecording, clearRecording: true});
              throw new Error("Can't convert audio!");
            }
            this.setState({currentUserDefinition: reader.result.toString()}, () => {
              this.updateRecording({nextState: RecordingState.AwaitingSubmit, clearRecording: false});
              if (showRecordingTimeLimitReached) {
                // wait until the ui is updated before alerting
                setTimeout(() => alert(i18n.translate("recordingTimeLimitReached")), 10);
              }
            });
          };
          reader.readAsDataURL(recording);
        };
        this.recordingTimeout = window.setTimeout(() => {
          this.context.log({event: "recording timeout reached"});
          this.handleStopRecording();
          showRecordingTimeLimitReached = true;
        }, RECORDING_TIMEOUT);
        this.context.log({event: "started recording"});
        this.mediaRecorder.start();
      })
      .catch(err => alert(err.toString()));
  }

  private handleStopRecording = () => {
    clearTimeout(this.recordingTimeout);
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
    }
  }

  private handlePlayRecording = () => {
    const logPlay = () => this.context.log({event: "play unsubmitted recording"});
    if (this.audio) {
      // toggle audio
      if (this.audio.paused) {
        logPlay();
        this.audio.currentTime = 0;
        this.audio.play();
      } else {
        this.audio.pause();
      }
    } else {
      getAudio(this.state.currentUserDefinition)
        .then((audio) => {
          logPlay();
          this.audio = audio;
          this.audio.play();
        })
        .catch((err) => alert(err.toString()));
    }
  }

  private handleDeleteRecording = () => {
    this.updateRecording({nextState: RecordingState.NotRecording, clearRecording: true});
  }

  private canRecord(props: IProps) {
    return !!props.enableStudentRecording
        && !!((navigator.mediaDevices?.getUserMedia !== undefined) && MediaRecorder);
  }
}
