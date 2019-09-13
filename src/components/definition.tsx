import * as React from "react";
import * as css from "./definition.scss";
import * as icons from "./icons.scss";

interface IProps {
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

const speechLabel = "Read aloud";
const imageLabel  = "View photo";
const videoLabel  = "View movie";

// IE11 doesn't support this API.
const textToSpeechAvailable = () => {
  return typeof SpeechSynthesisUtterance === "function" && typeof speechSynthesis === "object";
};

const renderTextToSpeech = (onClick: () => void) => {
  if (!textToSpeechAvailable()) {
    return null;
  }
  return(
    <span
      className={icons.iconButton + " " + icons.iconAudio}
      onClick={onClick}
      title={speechLabel}
    />
  );
};

const read = (text: string) => {
  const msg = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(msg);
};

export default class Definition extends React.Component<IProps, IState> {
  public state: IState = {
    imageVisible: !!this.props.imageUrl && !!this.props.autoShowMedia,
    // Video is loaded automatically only if there's no image.
    videoVisible: !!this.props.videoUrl && !this.props.imageUrl && !!this.props.autoShowMedia
  };

  public renderImageButton(imageUrl?: string) {
    if (imageUrl) {
      return(
        <span
          className={icons.iconButton + " " + icons.iconImage}
          onClick={this.toggleImage}
          title={imageLabel}
        />
      );
    }
    return null;
  }

  public renderVideoButton(videoUrl?: string) {
    if (videoUrl) {
      return(
        <span
          className={icons.iconButton + " " + icons.iconVideo}
          onClick={this.toggleVideo}
          title={videoLabel}
        />
      );
    }
    return null;
  }

  public render() {
    const { definition, imageUrl, videoUrl, imageCaption, videoCaption } = this.props;
    const { imageVisible, videoVisible } = this.state;
    return (
      <div>
          <div>
            {definition}
            <span className={css.icons}>
              {renderTextToSpeech(this.readDefinition)}
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
                {imageCaption}
                {renderTextToSpeech(this.readImageCaption)}
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
                {renderTextToSpeech(this.readVideoCaption)}
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
