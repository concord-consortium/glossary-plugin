import * as React from "react";
import * as css from "./definition.scss";
import * as icons from "../common/icons.scss";
import { pluginContext } from "../../plugin-context";
import { definitionTerm, imageCaptionTerm, videoCaptionTerm } from "../../utils/translation-utils";
import TextToSpeech from "./text-to-speech";

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

  public render() {
    const { imageUrl, videoUrl, imageCaption, videoCaption, word } = this.props;
    const { imageVisible, videoVisible } = this.state;
    return (
      <div>
        <div>
          {this.translatedDefinition}
          <span className={css.icons}>
          <TextToSpeech text={this.translatedDefinition} word={word} textType="definition" />
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
                <TextToSpeech text={this.translatedImageCaption} word={word} textType="image caption" />
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
                <TextToSpeech text={this.translatedVideoCaption} word={word} textType="video caption" />
              </div>
            }
          </div>
        }
      </div>
    );
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
