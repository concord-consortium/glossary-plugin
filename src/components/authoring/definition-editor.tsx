import * as React from "react";
import * as css from "./definition-editor.scss";
import { IWordDefinition } from "../types";
import Button from "./button";

interface IProps {
  onSave: (definition: IWordDefinition) => void;
  onCancel: () => void;
  initialDefinition?: IWordDefinition;
}

interface IState extends IWordDefinition {
  error: string;
}

export default class DefinitionEditor extends React.Component<IProps, IState> {
  public state: IState = {
    word: this.getInitial("word") || "",
    definition: this.getInitial("definition") || "",
    image: this.getInitial("image") || "",
    imageCaption: this.getInitial("imageCaption") || "",
    video: this.getInitial("video") || "",
    videoCaption: this.getInitial("videoCaption") || "",
    error: ""
  };

  public render() {
    const { onCancel, initialDefinition } = this.props;
    const { word, definition, image, imageCaption, video, videoCaption, error } = this.state;
    return (
      <div className={css.editor}>
        <table>
          <tbody>
            <tr>
              <td>{initialDefinition ? "Edit word" : "Word"}</td>
              <td>
                {
                  initialDefinition ?
                    initialDefinition.word :
                    <input type="text" name="word" value={word} onChange={this.handleInputChange}/>
                }
              </td>
            </tr>
            <tr>
              <td>Definition</td>
              <td><textarea name="definition" value={definition} onChange={this.handleInputChange}/></td>
            </tr>
            <tr>
              <td>Image URL</td>
              <td><input type="text" value={image} name="image" onChange={this.handleInputChange}/></td>
            </tr>
            <tr>
              <td>Image caption</td>
              <td><input type="text" value={imageCaption} name="imageCaption" onChange={this.handleInputChange}/></td>
            </tr>
            <tr>
              <td>Video URL</td>
              <td><input type="text" value={video} name="video" onChange={this.handleInputChange}/></td>
            </tr>
            <tr>
              <td>Video caption</td>
              <td><input type="text" value={videoCaption} name="videoCaption" onChange={this.handleInputChange}/></td>
            </tr>
          </tbody>
        </table>
        <div className={css.error}>{error}</div>
        <Button label="Save" onClick={this.handleSave}/>
        <Button label="Cancel" onClick={onCancel}/>
      </div>
    );
  }

  private getInitial(prop: string) {
    return this.props.initialDefinition && (this.props.initialDefinition as any)[prop];
  }

  private handleInputChange = (event: React.ChangeEvent) => {
    const name = (event.target as HTMLInputElement).name;
    const value = (event.target as HTMLInputElement).value;
    switch (name) {
      case "word": this.setState({word: value}); break;
      case "definition": this.setState({definition: value}); break;
      case "image": this.setState({image: value}); break;
      case "imageCaption": this.setState({imageCaption: value}); break;
      case "video": this.setState({video: value}); break;
      case "videoCaption": this.setState({videoCaption: value}); break;
    }
  }

  private handleSave = () => {
    const { word, definition, image, imageCaption, video, videoCaption } = this.state;
    if (!word) {
      this.setState({error: 'Missing "word" property'});
      return;
    }
    if (!definition) {
      this.setState({error: 'Missing "definition" property'});
      return;
    }
    this.props.onSave({
      word, definition, image, imageCaption, video, videoCaption
    });
  }
}
