import * as React from "react";
import * as icons from "../common/icons.scss";
import { pluginContext } from "../../plugin-context";

interface IProps {
  text: string;
  word: string; // needed for logging
  textType: string; // needed for logging
  onClick?: () => void;
}

// IE11 doesn't support this API.
const textToSpeechAvailable = () => {
  return typeof SpeechSynthesisUtterance === "function" && typeof speechSynthesis === "object";
};

const read = (text: string, langCode: string) => {
  const msg = new SpeechSynthesisUtterance(text);
  msg.lang = langCode;
  window.speechSynthesis.speak(msg);
};

export default class TextToSpeech extends React.Component<IProps, {}> {
  public static contextType = pluginContext;

  public render() {
    if (!textToSpeechAvailable()) {
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
    const { text, word, textType } = this.props;
    read(text, this.context.lang);
    this.context.log({
      event: "text to speech clicked",
      word,
      textType
    });
  }
}
