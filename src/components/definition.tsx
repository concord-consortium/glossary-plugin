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

const read = (text: string) => {
  const msg = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(msg);
};

export default class Definition extends React.Component<IProps, IState> {
  public state: IState = {
    imageVisible: false,
    videoVisible: false
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
            {
              imageCaption &&
              <div className={css.caption}>
                {imageCaption}
                {
                  textToSpeechAvailable() &&
                  <span className={icons.iconButton + " " + icons.iconAudio} onClick={this.readImageCaption}/>
                }
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
                {videoCaption}
                {
                  textToSpeechAvailable() &&
                  <span className={icons.iconButton + " " + icons.iconAudio} onClick={this.readVideoCaption}/>
                }
              </div>
            }
          </div>
        }
      </div>
    );
  }

  private readDefinition = () => {
    const { definition } = this.props;
    read(definition);
  }

  private readImageCaption = () => {
    const { imageCaption } = this.props;
    if (imageCaption) {
      read(imageCaption);
    }
  }

  private readVideoCaption = () => {
    const { videoCaption } = this.props;
    if (videoCaption) {
      read(videoCaption);
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
