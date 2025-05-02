import * as React from "react";
import * as icons from "../common/icons.scss";
import { pluginContext } from "../../plugin-context";
import { TextKey, canUseBrowserTextToSpeech, getMp3Term, isValidMp3Url } from "../../utils/translation-utils";

interface IProps {
  text: string;
  word: string; // needed for logging
  textKey: TextKey;
  onClick?: () => void;
}

// IE11 doesn't support this API. Also, not all the languages are supported by the browsers.
const textToSpeechAvailable = (langCode: string) => {
  return typeof SpeechSynthesisUtterance === "function" && typeof speechSynthesis === "object" &&
    canUseBrowserTextToSpeech(langCode);
};

interface IState {
  reading: boolean;
  audio: HTMLAudioElement | null;
}

export default class TextToSpeech extends React.Component<IProps, IState> {
  public static contextType = pluginContext;

  public componentWillUnmount() {
    window.speechSynthesis?.cancel();
    this.state.audio?.pause();
  }

  public state: IState = {
    reading: false,
    audio: null,
  };

  public get shouldRender() {
    return this.customMp3Recording || textToSpeechAvailable(this.context.lang);
  }

  public get customMp3Recording() {
    const { word, textKey } = this.props;
    const mp3Url = this.context.translate(getMp3Term(textKey, word));
    if (isValidMp3Url(mp3Url)) {
      return mp3Url;
    }
    return null;
  }

  public render() {
    if (!this.shouldRender) {
      return null;
    }
    const {reading} = this.state;
    const {translate} = this.context;
    return(
      <span
        className={icons.iconButton + " " + (reading ? icons.iconStop : icons.iconAudio)}
        onClick={this.read}
        title={translate("speechTitle")}
        data-testid="text-to-speech-button"
      />
    );
  }

  private read = () => {
    const { text, word, textKey } = this.props;
    if (this.customMp3Recording) {
      if (this.state.reading) {
        this.state.audio?.pause();
        this.setState({audio: null, reading: false});
      } else {
        const audio = new Audio(this.customMp3Recording);
        audio.onplay = () => this.setState({audio, reading: true});
        audio.onended = () => this.setState({audio: null, reading: false});
        audio.play();
      }
    } else if (textToSpeechAvailable(this.context.lang)) {
      if (this.state.reading) {
        // if currently reading in this instance stop
        window.speechSynthesis.cancel();
      } else {
        const msg = new SpeechSynthesisUtterance(text);
        msg.lang = this.context.lang === "en" ? "en-US" : this.context.lang;
        msg.rate = 0.7;
        msg.addEventListener("start", () => this.setState({reading: true}));
        msg.addEventListener("end", () => this.setState({reading: false}));
        // stop any other TextToSpeech instances and then start speaking
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(msg);
      }
    }
    this.context.log({
      event: "text to speech clicked",
      word,
      textType: textKey
    });
  }
}
