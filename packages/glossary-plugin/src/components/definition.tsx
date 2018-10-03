import * as React from "react";
import * as css from "./definition.scss";
import * as icons from "./icons.scss";

interface IProps {
  definition: string;
  imageUrl?: string;
  videoUrl?: string;
  imageCaption?: string;
  videoCaption?: string;
}

interface IState {
  imageVisible: boolean;
  videoVisible: boolean;
}

// IE11 doesn't support this API.
const textToSpeechAvailable = () => {
  return typeof SpeechSynthesisUtterance === "function" && typeof speechSynthesis === "object";
};

export default class Definition extends React.Component<IProps, IState> {
  public state: IState = {
    imageVisible: false,
    videoVisible: false,
  };

  public render() {
    const { definition, imageUrl, videoUrl, imageCaption, videoCaption } = this.props;
    const { imageVisible, videoVisible } = this.state;
    return (
      <div>
          <div>
            {definition}
            <span className={css.icons}>
              {
                textToSpeechAvailable() &&
                <span className={icons.iconButton + " " + icons.iconAudio} onClick={this.readDefinition}/>
              }
              {imageUrl && <span className={icons.iconButton + " " + icons.iconImage} onClick={this.toggleImage}/>}
              {videoUrl && <span className={icons.iconButton + " " + icons.iconVideo} onClick={this.toggleVideo}/>}
            </span>
          </div>
        {
          imageVisible &&
          <div className={css.imageContainer}>
            <img src={imageUrl} />
            <div className={css.caption}>{imageCaption}</div>
          </div>
        }
        {
          videoVisible &&
          <div className={css.imageContainer}>
            <video src={videoUrl} controls={true}/>
            <div className={css.caption}>{videoCaption}</div>
          </div>
        }
      </div>
    );
  }

  private readDefinition = () => {
    const { definition } = this.props;
    const msg = new SpeechSynthesisUtterance(definition);
    window.speechSynthesis.speak(msg);
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
