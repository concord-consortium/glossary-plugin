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

const read = (text: string, langCode: string) => {
  const msg = new SpeechSynthesisUtterance(text);
  msg.lang = langCode;
  msg.rate = 0.7;
  const alex = window.speechSynthesis.getVoices().find((voice) => voice.name === "Alex (en-US)");
  if (alex) {
    msg.voice = alex;
  }
  window.speechSynthesis.speak(msg);
};

export default class TextToSpeech extends React.Component<IProps, {}> {
  public static contextType = pluginContext;

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
    const translate = this.context.translate;
    return(
      <span
        className={icons.iconButton + " " + icons.iconAudio}
        onClick={this.read}
        title={translate("speechTitle")}
      />
    );
  }

  private read = () => {
    const { text, word, textKey } = this.props;
    if (this.customMp3Recording) {
      new Audio(this.customMp3Recording).play();
    } else if (textToSpeechAvailable(this.context.lang)) {
      read(text, this.context.lang);
    }
    this.context.log({
      event: "text to speech clicked",
      word,
      textType: textKey
    });
  }
}
