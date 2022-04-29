import * as React from "react";
import { pluginContext } from "../../plugin-context";
import { term, TextKey } from "../../utils/translation-utils";
import TextToSpeech from "./text-to-speech";
import Image from "./image";
import Video from "./video";
import DiggingDeeper from "./digging-deeper";

import * as css from "./definition.scss";
import * as icons from "../common/icons.scss";

interface IProps {
  word: string;
  definition: string;
  diggingDeeper?: string;
  imageUrl?: string;
  zoomImageUrl?: string;
  imageCaption?: string;
  imageAltText?: string;
  videoUrl?: string;
  videoCaption?: string;
  videoAltText?: string;
  closedCaptionsUrl?: string;
  autoShowMedia?: boolean;
  disableReadAloud?: boolean;
}

interface IState {
  imageVisible: boolean;
  videoVisible: boolean;
  diggingDeeperVisible: boolean;
}

export default class Definition extends React.Component<IProps, IState> {
  public static contextType = pluginContext;

  public state: IState = {
    imageVisible: !!this.props.imageUrl && !!this.props.autoShowMedia,
    // Video is loaded automatically only if there's no image.
    videoVisible: !!this.props.videoUrl && !this.props.imageUrl && !!this.props.autoShowMedia,
    diggingDeeperVisible: false,
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
    return translate(term[TextKey.Definition](word), definition);
  }

  public get translatedDiggingDeeper() {
    const { diggingDeeper, word } = this.props;
    const translate = this.context.translate;
    return translate(term[TextKey.DiggingDeeper](word), diggingDeeper)
  }

  public get translatedImageCaption() {
    const { imageCaption, word } = this.props;
    const translate = this.context.translate;
    return translate(term[TextKey.ImageCaption](word), imageCaption);
  }

  public get translatedImageAltText() {
    const { imageAltText, word } = this.props;
    const translate = this.context.translate;
    return translate(term[TextKey.ImageAltText](word), imageAltText);
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

  public renderDiggingDeeperButton(diggingDeeper?: string) {
    if (diggingDeeper) {
      const translate = this.context.translate;
      return(
        <span
          className={icons.iconButton + " " + icons.iconDiggingDeeper}
          onClick={this.toggleDiggingDeeper}
          title={translate("viewDiggingDeeper")}
        />
      )
    }
  }

  public render() {
    const { imageUrl, zoomImageUrl, videoUrl, imageCaption, imageAltText, videoCaption, videoAltText, closedCaptionsUrl, word, definition, diggingDeeper, disableReadAloud } = this.props;
    const { imageVisible, videoVisible, diggingDeeperVisible } = this.state;
    const hasDefinition = definition.length > 0
    return (
      <div>
        {hasDefinition && <div>
          <span className={css.disableSelect}>{this.translatedDefinition}</span>
          <span className={css.icons}>
            {!disableReadAloud && <TextToSpeech text={this.translatedDefinition} word={word} textKey={TextKey.Definition} />}
            {this.renderImageButton(imageUrl)}
            {this.renderVideoButton(videoUrl)}
            {this.renderDiggingDeeperButton(diggingDeeper)}
          </span>
        </div>}
        { diggingDeeperVisible &&
          <DiggingDeeper word={word} diggingDeeper={diggingDeeper} disableReadAloud={disableReadAloud}/>
        }
        {
          imageVisible &&
          <Image
            word={word}
            definition={definition}
            imageUrl={imageUrl}
            zoomImageUrl={zoomImageUrl}
            imageCaption={imageCaption}
            imageAltText={imageAltText}
            disableReadAloud={disableReadAloud}
          />
        }
        {
          videoVisible &&
            <Video
              word={word}
              definition={definition}
              videoUrl={videoUrl}
              videoCaption={videoCaption}
              videoAltText={videoAltText}
              closedCaptionsUrl={closedCaptionsUrl}
              disableReadAloud={disableReadAloud}
            />
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

  private toggleDiggingDeeper = () => {
    const { diggingDeeperVisible } = this.state;
    const { word } = this.props;
    const newValue = !diggingDeeperVisible;
    this.setState({
      diggingDeeperVisible: newValue,
    });
    if (newValue) {
      this.context.log({
        event: "digging deeper icon clicked",
        word
      })
    }
  }
}
