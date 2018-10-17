import * as React from "react";
import * as css from "./definition-editor.scss";
import { IWordDefinition } from "../types";
import Button from "./button";
import { validateDefinition } from "../../utils/validate-glossary";
import Dropzone from "react-dropzone";
import { v1 as uuid } from "uuid";
import { s3Upload } from "../../utils/s3-helpers";

export const MEDIA_S3_DIR = "media";

interface IProps {
  onSave: (definition: IWordDefinition) => void;
  onCancel: () => void;
  s3AccessKey: string;
  s3SecretKey: string;
  initialDefinition?: IWordDefinition;
}

interface IState {
  definition: IWordDefinition;
  imageFile: File | null;
  videoFile: File | null;
  uploadInProgress: boolean;
  uploadStatus: string;
  error: string;
}

const removeEmptyProps = (obj: any) => {
  const result: any = {};
  Object.keys(obj).forEach(key => {
    if (obj[key] !== "") {
      result[key] = obj[key];
    }
  });
  return result;
};

const wrongFileTypeAlert = (rejected: File[]) => {
  alert(`File ${rejected[0].name} can't be uploaded. Please use one of the supported file types.`);
};

export default class DefinitionEditor extends React.Component<IProps, IState> {
  public state: IState = {
    definition: Object.assign({
      word: "",
      definition: "",
      image: "",
      imageCaption: "",
      video: "",
      videoCaption: ""
    }, this.props.initialDefinition),
    imageFile: null,
    videoFile: null,
    uploadInProgress: false,
    uploadStatus: "",
    error: ""
  };

  public render() {
    const { onCancel, initialDefinition } = this.props;
    const { definition, error, imageFile, videoFile, uploadStatus, uploadInProgress } = this.state;
    // imageFile is a custom file selected by user.
    const image = imageFile ? `[file to upload]: ${imageFile.name}` : definition.image;
    // videoFile is a custom file selected by user.
    const video = videoFile ? `[file to upload]: ${videoFile.name}` : definition.video;
    return (
      <div className={css.editor}>
        <table>
          <tbody>
            <tr>
              <td>{initialDefinition ? "Edit word" : "Word"}</td>
              <td>
                {
                  // When `initialDefinition` is present, it means that user is editing existing definition.
                  // Otherwise, he's adding a new one. Let users edit "word" only while they're adding a new one.
                  // If they could edit "word", duplicate entries and conflicts could happen.
                  initialDefinition ?
                    initialDefinition.word :
                    <input type="text" name="word" value={definition.word} onChange={this.handleInputChange}/>
                }
              </td>
            </tr>
            <tr>
              <td>Definition</td>
              <td><textarea name="definition" value={definition.definition} onChange={this.handleInputChange}/></td>
            </tr>
            <tr>
              <td>Image URL</td>
              <td><input type="text" value={image} name="image" onChange={this.handleInputChange}/></td>
            </tr>
            <tr>
              <td/>
              <td>
                <Dropzone
                  className={css.dropzone}
                  activeClassName={css.dropzoneActive}
                  rejectClassName={css.dropzoneReject}
                  accept="image/png, image/jpeg, image/gif, image/svg+xml, image/webp"
                  multiple={false}
                  onDropAccepted={this.handleImageDrop}
                  onDropRejected={wrongFileTypeAlert}
                >
                  Drop an image here, or click to select a file to upload. Only popular image formats are supported
                  (e.g. png, jpeg, gif, svg, webp).
                </Dropzone>
                {/* If user selects a new local file to upload, clear preview to avoid confusion */}
                {image && !imageFile && <img src={image}/>}
              </td>
            </tr>
            <tr>
              <td>Image caption</td>
              <td><input
                type="text"
                value={definition.imageCaption}
                name="imageCaption"
                onChange={this.handleInputChange}
              /></td>
            </tr>
            <tr>
              <td>Video URL</td>
              <td><input type="text" value={video} name="video" onChange={this.handleInputChange}/></td>
            </tr>
            <tr>
              <td/>
              <td>
                <Dropzone
                  className={css.dropzone}
                  activeClassName={css.dropzoneActive}
                  rejectClassName={css.dropzoneReject}
                  accept="video/mp4, video/ogg, video/webm"
                  multiple={false}
                  onDropAccepted={this.handleVideoDrop}
                  onDropRejected={wrongFileTypeAlert}
                >
                  Drop a video here, or click to select a file to upload. Supported formats: mp4, ogg, webm.
                </Dropzone>
                {/* If user selects a new local file to upload, clear preview to avoid confusion */}
                {video && !videoFile && <video src={video} controls={true}/>}
              </td>
            </tr>
            <tr>
              <td>Video caption</td>
              <td><input
                type="text"
                value={definition.videoCaption}
                name="videoCaption"
                onChange={this.handleInputChange}
              /></td>
            </tr>
          </tbody>
        </table>
        <div className={css.info}>
          <div>{uploadStatus}</div>
          <div>{error}</div>
        </div>
        <Button disabled={uploadInProgress} data-cy="save" label="Save" onClick={this.handleSave}/>
        <Button disabled={uploadInProgress} data-cy="cancel" label="Cancel" onClick={onCancel}/>
      </div>
    );
  }

  // Type is either "image" or "video".
  public uploadMedia =  async (file: File) => {
    const { s3AccessKey, s3SecretKey } = this.props;
    this.setState({
      uploadInProgress: true,
      uploadStatus: `Uploading ${file.name}... Please wait.`
    });
    try {
      const url = await s3Upload({
        dir: MEDIA_S3_DIR,
        filename: uuid() + "-" + file.name,
        accessKey: s3AccessKey,
        secretKey: s3SecretKey,
        body: file,
        contentType: file.type,
        cacheControl: "max-age=31536000" // 1 year
      });
      this.setState({
        uploadInProgress: false,
        uploadStatus: ""
      });
      return url;
    } catch (e) {
      // Cleanup state managed by this helper.
      this.setState({
        uploadInProgress: false,
        uploadStatus: `Uploading ${file.name} failed. Please try again.`
      });
      // Rethrow error, so we can interrupt saving too.
      throw e;
    }
  }

  private handleInputChange = (event: React.ChangeEvent) => {
    const name = (event.target as HTMLInputElement).name;
    const value = (event.target as HTMLInputElement).value;
    const { definition } = this.state;
    this.setState({ definition: Object.assign({}, definition, {[name]: value}) });
  }

  private handleImageDrop = (files: File[]) => {
    if (!files[0]) {
      return;
    }
    const { definition } = this.state;
    // Cleanup anything that user typed into "Image URL" field before to avoid subtle bugs (e.g. when this string
    // doesn't pass validation).
    this.setState({ imageFile: files[0], definition: Object.assign({}, definition, {image: ""}) });
  }

  private handleVideoDrop = (files: File[]) => {
    if (!files[0]) {
      return;
    }
    const { definition } = this.state;
    // Cleanup anything that user typed into "Video URL" field before to avoid subtle bugs (e.g. when this string
    // doesn't pass validation).
    this.setState({ videoFile: files[0], definition: Object.assign({}, definition, {video: ""}) });
  }

  private handleSave = async () => {
    // Hide old errors first.
    this.setState({error: ""});
    const { definition, videoFile, imageFile } = this.state;
    // Definition passed to a parent has a bit different format that internally stored object that is used
    // to control text inputs.
    let finalDefinition = Object.assign({}, definition);
    // Note that we don't want empty strings to be present in the final definition. JSON Schema validation would fail.
    finalDefinition = removeEmptyProps(finalDefinition);
    const validation = validateDefinition(finalDefinition);
    if (!validation.valid) {
      this.setState({error: validation.error});
      return;
    }
    // Now, handle media upload if necessary.
    if (imageFile) {
      try {
        const image = await this.uploadMedia(imageFile);
        finalDefinition = Object.assign(finalDefinition, { image });
      } catch (e) {
        // Upload failed. Interrupt saving process.
        this.setState({error: e});
        return;
      }
    }
    if (videoFile) {
      try {
        const video = await this.uploadMedia(videoFile);
        finalDefinition = Object.assign(finalDefinition, { video });
      } catch (e) {
        // Upload failed. Interrupt saving process.
        this.setState({error: e});
        return;
      }
    }
    this.props.onSave(finalDefinition);
  }
}
