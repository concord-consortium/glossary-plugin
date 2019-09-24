import * as React from "react";
import * as css from "./definition.scss";
import * as icons from "./icons.scss";
import { i18nContext } from "../i18n-context";
import { definitionTerm, imageCaptionTerm, videoCaptionTerm } from "../utils/translation-utils";

interface IProps {
  word: string;
  definition: string;
  imageUrl?: string;
  videoUrl?: string;
  imageCaption?: string;
  videoCaption?: string;
  autoShowMedia?: boolean;
}

interface IState {
  imageVisible: boolean;
  videoVisible: boolean;
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

export default class Definition extends React.Component<IProps, IState> {
  public static contextType = i18nContext;

  public state: IState = {
    imageVisible: !!this.props.imageUrl && !!this.props.autoShowMedia,
    // Video is loaded automatically only if there's no image.
    videoVisible: !!this.props.videoUrl && !this.props.imageUrl && !!this.props.autoShowMedia
  };

  public get translatedDefinition() {
    const { definition, word } = this.props;
    const i18n = this.context;
    return i18n.translate(definitionTerm(word), definition);
  }

  public get translatedImageCaption() {
    const { imageCaption, word } = this.props;
    const i18n = this.context;
    return i18n.translate(imageCaptionTerm(word), imageCaption);
  }

  public get translatedVideoCaption() {
    const { videoCaption, word } = this.props;
    const i18n = this.context;
    return i18n.translate(videoCaptionTerm(word), videoCaption);
  }

  public renderImageButton(imageUrl?: string) {
    if (imageUrl) {
      const i18n = this.context;
      return(
        <span
          className={icons.iconButton + " " + icons.iconImage}
          onClick={this.toggleImage}
          title={i18n.translate("imageTitle")}
        />
      );
    }
    return null;
  }

  public renderVideoButton(videoUrl?: string) {
    if (videoUrl) {
      const i18n = this.context;
      return(
        <span
          className={icons.iconButton + " " + icons.iconVideo}
          onClick={this.toggleVideo}
          title={i18n.translate("videoTitle")}
        />
      );
    }
    return null;
  }

  public renderTextToSpeech(onClick: () => void) {
    if (!textToSpeechAvailable()) {
      return null;
    }
    const i18n = this.context;
    return(
      <span
        className={icons.iconButton + " " + icons.iconAudio}
        onClick={onClick}
        title={i18n.translate("speechTitle")}
      />
    );
  }

  public render() {
    const { imageUrl, videoUrl, imageCaption, videoCaption } = this.props;
    const { imageVisible, videoVisible } = this.state;
    return (
      <div>
        <div>
          {this.translatedDefinition}
          <span className={css.icons}>
          {this.renderTextToSpeech(this.readDefinition)}
            {this.renderImageButton(imageUrl)}
            {this.renderVideoButton(videoUrl)}
        </span>
        </div>
        {
          imageVisible &&
          <div className={css.imageContainer}>
            <img src={imageUrl} />
            {
              imageCaption &&
              <div className={css.caption}>
                {this.translatedImageCaption}
                {this.renderTextToSpeech(this.readImageCaption)}
              </div>
            }
          </div>
        }
        {
          videoVisible &&
          <div className={css.imageContainer}>
            <video src={videoUrl} controls={true}/>
            {
              videoCaption &&
              <div className={css.caption}>
                {this.translatedVideoCaption}
                {this.renderTextToSpeech(this.readVideoCaption)}
              </div>
            }
          </div>
        }
      </div>
    );
  }

  private readDefinition = () => {
    const i18n = this.context;
    read(this.translatedDefinition, i18n.lang);
  }

  private readImageCaption = () => {
    const { imageCaption } = this.props;
    const i18n = this.context;
    if (imageCaption) {
      read(this.translatedImageCaption, i18n.lang);
    }
  }

  private readVideoCaption = () => {
    const { videoCaption } = this.props;
    const i18n = this.context;
    if (videoCaption) {
      read(this.translatedVideoCaption, i18n.lang);
    }
  }

  private toggleImage = () => {
    const { imageVisible } = this.state;
    this.setState({
      imageVisible: !imageVisible,
      // Never display both image and video at the same time.
      videoVisible: false
    });
  }

  private toggleVideo = () => {
    const { videoVisible } = this.state;
    this.setState({
      videoVisible: !videoVisible,
      // Never display both image and video at the same time.
      imageVisible: false
    });
  }
}
