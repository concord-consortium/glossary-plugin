import * as React from "react";
import * as css from "./image.scss";
import * as icons from "../common/icons.scss";
import { pluginContext } from "../../plugin-context";
import { term, TextKey } from "../../utils/translation-utils";
import TextToSpeech from "./text-to-speech";

interface IProps {
  word: string;
  definition: string;
  imageUrl?: string;
  zoomImageUrl?: string;
  imageCaption?: string;
  imageAltText?: string;
  disableReadAloud?: boolean;
}

interface IState {
  imageZoomed: boolean;
  unZoomedImageWidth: number;
}

export default class Image extends React.Component<IProps, IState> {
  public static contextType = pluginContext;

  public state: IState = {
    imageZoomed: false,
    unZoomedImageWidth: 0
  };

  public get translatedDefinition() {
    const { definition, word } = this.props;
    const translate = this.context.translate;
    return translate(term[TextKey.Definition](word), definition);
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

  public render() {
    const { imageUrl, imageCaption, word, imageAltText, disableReadAloud } = this.props;
    const { imageZoomed } = this.state;
    const translate = this.context.translate;
    return (
      <>
        <div className={css.imageContainer}>
          <div className={css.imageWrapper} onClick={this.toggleImageZoom}>
            <img src={imageUrl} title={imageAltText ? this.translatedImageAltText : ""} alt={imageAltText ? this.translatedImageAltText : ""}/>
            <div className={css.zoomButton}>
              <span
                className={icons.iconButton + " " + icons.iconZoomIn}
                title={translate("zoomInTitle")}
              />
            </div>
          </div>
          {
            imageCaption &&
            <div className={css.caption}>
              {this.translatedImageCaption}
              {!disableReadAloud && <TextToSpeech text={this.translatedImageCaption} word={word} textKey={TextKey.ImageCaption} />}
            </div>
          }
        </div>
        {imageZoomed ? this.renderZoomedImage() : null}
      </>
    );
  }

  private renderZoomedImage() {
    const {imageUrl, zoomImageUrl, word, imageCaption, imageAltText, disableReadAloud} = this.props;
    return (
      <div className={css.zoomContainer}>
        <div className={css.zoomBackground} />
        <div className={css.zoomWrapper}>
          <div className={css.zoomTitle}>
            <div className={css.zoomTitleLabel}>{word}</div>
            <div className={css.zoomTitleIcon}>
              <span className={icons.iconCross} onClick={this.toggleImageZoom} />
          </div>
          </div>
          <div className={css.zoomImage} onClick={this.toggleImageZoom}>
            <img src={zoomImageUrl || imageUrl} title={imageAltText ? this.translatedImageAltText : ""} alt={imageAltText ? this.translatedImageAltText : ""}/>
          </div>
          <div className={css.zoomCaption}>
            {imageCaption ?
              <>
                {this.translatedImageCaption}
                {!disableReadAloud && <TextToSpeech text={this.translatedImageCaption} word={word} textKey={TextKey.ImageCaption} />}
              </> : ""}
            </div>
        </div>
      </div>
    );
  }

  private toggleImageZoom = () => {
    const { imageZoomed } = this.state;
    const { word } = this.props;
    const newValue = !imageZoomed;
    this.setState({
      imageZoomed: newValue,
    });
    this.context.log({
      event: `"image zoomed ${newValue ? "in" : "out"}`,
      word
    });
  }
}
