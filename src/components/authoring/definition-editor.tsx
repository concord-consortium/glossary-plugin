import * as React from "react";
import * as css from "./definition-editor.scss";
import { IWordDefinition } from "../types";
import Button from "./button";
import { validateDefinition } from "../../utils/validate-glossary";

interface IProps {
  onSave: (definition: IWordDefinition) => void;
  onCancel: () => void;
  initialDefinition?: IWordDefinition;
}

interface IState {
  definition: IWordDefinition;
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
    error: ""
  };

  public render() {
    const { onCancel, initialDefinition } = this.props;
    const { definition, error } = this.state;
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
              <td><input type="text" value={definition.image} name="image" onChange={this.handleInputChange}/></td>
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
              <td><input type="text" value={definition.video} name="video" onChange={this.handleInputChange}/></td>
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
        <div className={css.error}>{error}</div>
        <Button label="Save" onClick={this.handleSave}/>
        <Button label="Cancel" onClick={onCancel}/>
      </div>
    );
  }

  private handleInputChange = (event: React.ChangeEvent) => {
    const name = (event.target as HTMLInputElement).name;
    const value = (event.target as HTMLInputElement).value;
    const { definition } = this.state;
    this.setState({ definition: Object.assign({}, definition, {[name]: value}) });
  }

  private handleSave = () => {
    const { definition } = this.state;
    // Note that we don't want empty strings to be present in definition. JSON Schema validation would fail.
    const processedDef = removeEmptyProps(definition);
    const validation = validateDefinition(processedDef);
    if (!validation.valid) {
      this.setState({error: validation.error});
      return;
    }
    this.props.onSave(processedDef);
  }
}
