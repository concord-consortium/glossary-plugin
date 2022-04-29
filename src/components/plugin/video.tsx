import * as React from "react";
import { pluginContext } from "../../plugin-context";
import { term, TextKey } from "../../utils/translation-utils";
import TextToSpeech from "./text-to-speech";

import * as css from "./glossary-popup.scss";

interface IProps {
  word: string;
  definition: string;
  videoUrl?: string;
  videoCaption?: string;
  videoAltText?: string;
  closedCaptionsUrl?: string;
  disableReadAloud?: boolean;
}

export default class Video extends React.Component<IProps> {
  public static contextType = pluginContext;

  public get translatedVideoCaption() {
    const { videoCaption, word } = this.props;
    const translate = this.context.translate;
    return translate(term[TextKey.VideoCaption](word), videoCaption);
  }

  public get translatedVideoAltText() {
    const { videoAltText, word } = this.props;
    const translate = this.context.translate;
    return translate(term[TextKey.VideoAltText](word), videoAltText);
  }

  public get translatedClosedCaptionsUrl() {
    const { closedCaptionsUrl, word } = this.props;
    const translate = this.context.translate;
    return translate(term[TextKey.ClosedCaptionsUrl](word), closedCaptionsUrl);
  }

  render () {
    const {word, videoUrl, videoCaption, videoAltText, closedCaptionsUrl, disableReadAloud} = this.props;
    const {lang} = this.context;
    return (
      <div className={css.videoContainer}>
      {
        closedCaptionsUrl ?
        <video src={videoUrl} title={videoAltText} controls={true}>
          <track kind="subtitles" srcLang={lang} src={this.translatedClosedCaptionsUrl} default={true}/>
        </video> :
        <video src={videoUrl} title={videoAltText} controls={true}/>
      }
      {
        videoCaption &&
        <div className={css.caption}>
          {this.translatedVideoCaption}
          {
            !disableReadAloud &&
            <TextToSpeech text={this.translatedVideoCaption} word={word} textKey={TextKey.VideoCaption} />
          }
        </div>
      }
    </div>
    )
  }
}