import * as React from "react";
import * as css from "./definition.scss";
import * as icons from "./icons.scss";

interface IDefinitionProps {
  definition: string;
  userDefinitions: string[];
  imageUrl?: string;
  videoUrl?: string;
  imageCaption?: string;
  videoCaption?: string;
}

interface IDefinitionState {
  imageVisible: boolean;
  videoVisible: boolean;
}

export default class Definition extends React.Component<IDefinitionProps, IDefinitionState> {
  public state: IDefinitionState = {
    imageVisible: false,
    videoVisible: false
  };

  public render() {
    const { definition, userDefinitions, imageUrl, videoUrl, imageCaption, videoCaption } = this.props;
    const { imageVisible, videoVisible } = this.state;
    // The logic below is a bit scattered, but at least we don't have to repeat markup too much. And generally
    // it's not a rocket science, so I wouldn't worry about it too much. The most important is to handle
    // input and output (calling onUserDefinitionsUpdate) correctly as that's what the plugin code cares about.
    return (
      <div>
          <div>
            {definition}
            <span className={css.icons}>
              <span className={css.iconButton + " " + icons.iconAudio} onClick={this.readDefinition}/>
              {imageUrl && <span className={css.iconButton + " " + icons.iconImage} onClick={this.toggleImage}/>}
              {videoUrl && <span className={css.iconButton + " " + icons.iconVideo} onClick={this.toggleVideo}/>}
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
        {
          // If user already provided some answer, display them below.
          userDefinitions.length > 0 &&
          <div className={css.userDefinitions}>
            <hr/>
            <div>
              <b>My definition:</b>
            </div>
            {userDefinitions[userDefinitions.length - 1]}
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
