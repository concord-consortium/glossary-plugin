import * as React from "react";
import * as css from "./definition.scss";
import * as icons from "../common/icons.scss";
import { pluginContext } from "../../plugin-context";
import { definitionTerm, imageCaptionTerm, videoCaptionTerm } from "../../utils/translation-utils";

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
  public static contextType = pluginContext;

  public state: IState = {
    imageVisible: !!this.props.imageUrl && !!this.props.autoShowMedia,
    // Video is loaded automatically only if there's no image.
    videoVisible: !!this.props.videoUrl && !this.props.imageUrl && !!this.props.autoShowMedia
  };

  public componentDidMount() {
    const { word } = this.props;
    const { imageVisible } = this.state;
    if (imageVisible) {
      this.context.log({
        event: "image automatically shown",
        word
      });
    }
  }

  public get translatedDefinition() {
    const { definition, word } = this.props;
    const translate = this.context.translate;
    return translate(definitionTerm(word), definition);
  }

  public get translatedImageCaption() {
    const { imageCaption, word } = this.props;
    const translate = this.context.translate;
    return translate(imageCaptionTerm(word), imageCaption);
  }

  public get translatedVideoCaption() {
    const { videoCaption, word } = this.props;
    const translate = this.context.translate;
    return translate(videoCaptionTerm(word), videoCaption);
  }

  public renderImageButton(imageUrl?: string) {
    if (imageUrl) {
      const translate = this.context.translate;
      return(
        <span
          className={icons.iconButton + " " + icons.iconImage}
          onClick={this.toggleImage}
          title={translate("imageTitle")}
        />
      );
    }
    return null;
  }

  public renderVideoButton(videoUrl?: string) {
    if (videoUrl) {
      const translate = this.context.translate;
      return(
        <span
          className={icons.iconButton + " " + icons.iconVideo}
          onClick={this.toggleVideo}
          title={translate("videoTitle")}
        />
      );
    }
    return null;
  }

  public renderTextToSpeech(onClick: () => void) {
    if (!textToSpeechAvailable()) {
      return null;
    }
    const translate = this.context.translate;
    return(
      <span
        className={icons.iconButton + " " + icons.iconAudio}
        onClick={onClick}
        title={translate("speechTitle")}
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
    const { word } = this.props;
    read(this.translatedDefinition, this.context.lang);
    this.context.log({
      event: "text to speech clicked",
      word,
      textType: "definition"
    });
  }

  private readImageCaption = () => {
    const { imageCaption, word } = this.props;
    if (imageCaption) {
      read(this.translatedImageCaption, this.context.lang);
    }
    this.context.log({
      event: "text to speech clicked",
      word,
      textType: "image caption"
    });
  }

  private readVideoCaption = () => {
    const { videoCaption, word } = this.props;
    if (videoCaption) {
      read(this.translatedVideoCaption, this.context.lang);
    }
    this.context.log({
      event: "text to speech clicked",
      word,
      textType: "video caption"
    });
  }

  private toggleImage = () => {
    const { imageVisible } = this.state;
    const { word } = this.props;
    const newValue = !imageVisible;
    this.setState({
      imageVisible: newValue,
      // Never display both image and video at the same time.
      videoVisible: false
    });
    if (newValue) {
      this.context.log({
        event: "image icon clicked",
        word
      });
    }
  }

  private toggleVideo = () => {
    const { videoVisible } = this.state;
    const { word } = this.props;
    const newValue = !videoVisible;
    this.setState({
      videoVisible: newValue,
      // Never display both image and video at the same time.
      imageVisible: false
    });
    if (newValue) {
      this.context.log({
        event: "video icon clicked",
        word
      });
    }
  }
}
