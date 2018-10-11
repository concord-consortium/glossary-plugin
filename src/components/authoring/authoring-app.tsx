import * as React from "react";
import DefinitionEditor from "./definition-editor";
import Button from "./button";
import {IWordDefinition, IGlossary} from "../types";
import GlossarySidebar from "../glossary-sidebar";
import JSONEditor from "./json-editor";
import * as clone from "clone";
import getURLParam from "../../utils/get-url-param";
import { s3Upload } from "../../utils/s3-helpers";
import "whatwg-fetch"; // window.fetch polyfill for older browsers (IE)

import * as css from "./authoring-app.scss";
import * as icons from "../icons.scss";

interface IState {
  glossary: IGlossary;
  jsonEditorContent: object;
  newDefEditor: boolean;
  definitionEditors: {[word: string]: boolean};
  s3Url: string;
  s3AccessKey: string;
  s3SecretKey: string;
  s3ActionInProgress: boolean;
  s3Status: string;
}

// Keys used to obtain dat from URL or local storage.
const S3_URL = "s3Url";
const S3_ACCESS = "s3AccessKey";
const S3_SECRET = "s3SecretKey";

const DEFAULT_GLOSSARY = {
  askForUserDefinition: true,
  definitions: []
};

const getStatusTxt = (msg: string) => `[${(new Date()).toLocaleTimeString()}] ${msg}`;

export default class PluginApp extends React.Component<{}, IState> {
  public state: IState = {
    glossary: DEFAULT_GLOSSARY,
    jsonEditorContent: DEFAULT_GLOSSARY,
    newDefEditor: false,
    definitionEditors: {},
    s3Url: getURLParam(S3_URL) || localStorage.getItem(S3_URL) || "",
    s3AccessKey: getURLParam(S3_ACCESS) || localStorage.getItem(S3_ACCESS) || "",
    // Don't let users set S3 Secret Key using URL, so they don't share it by accident.
    s3SecretKey: localStorage.getItem(S3_SECRET) || "",
    s3ActionInProgress: false,
    s3Status: ""
  };

  public componentDidMount() {
    if (this.s3FeaturesAvailable) {
      this.loadJSONFromS3();
    }
  }

  public render() {
    const { newDefEditor, glossary, jsonEditorContent, definitionEditors,
      s3Url, s3AccessKey, s3SecretKey, s3Status } = this.state;
    const { askForUserDefinition, definitions } = glossary;
    return (
      <div>
        <div className={css.authoring}>
          <h2>Glossary Authoring</h2>
          <input type="checkbox" checked={askForUserDefinition} onChange={this.handleAskForUserDefChange}/>
          <label>
            Ask students for definition
            <div className={css.help}>
              When this option is turned on, students will have to provide their own definition
              before they can see an authored one.
            </div>
          </label>
          <h3>Definitions</h3>
          <table className={css.definitionsTable}>
            <tbody>
              {
                definitions.map(def => {
                  if (definitionEditors[def.word]) {
                    return <tr key={def.word} className={css.wordRow}><td colSpan={3}>
                      <DefinitionEditor
                        key={def.word}
                        initialDefinition={def}
                        onSave={this.editDef}
                        onCancel={this.toggleDefinitionEditor.bind(this, def.word)}
                      />
                    </td></tr>;
                  } else {
                    return <tr key={def.word} className={css.wordRow}>
                      <td className={css.definitionWord}>{def.word}</td>
                      <td className={css.definitionTxt}>{def.definition}</td>
                      <td className={css.definitionIcons}>
                        {def.image && <span className={icons.iconImage}/>}
                        {def.video && <span className={icons.iconVideo}/>}
                      </td>
                      <td className={css.definitionButtons}>
                        <Button label="Edit" onClick={this.toggleDefinitionEditor.bind(this, def.word)}/>
                        <Button label="Remove" onClick={this.removeDef.bind(this, def.word)}/>
                      </td>
                    </tr>;
                  }
                })
              }
            </tbody>
          </table>
          {!newDefEditor && <Button icon="iconPlus" label="Add a new definition" onClick={this.toggleNewDef}/>}
          {
            newDefEditor &&
            <DefinitionEditor
              onCancel={this.toggleNewDef}
              onSave={this.addNewDef}
            />
          }
        </div>
        <div className={css.jsonSection}>
          <h2>Glossary JSON</h2>
          <table className={css.s3Details}>
            <tbody>
            <tr>
              <td>S3 File URL</td>
              <td><input value={s3Url} type="text" name="s3Url" onChange={this.handleInputChange}/></td>
            </tr>
            <tr>
              <td>S3 Access Key</td>
              <td><input value={s3AccessKey} type="text" name="s3AccessKey" onChange={this.handleInputChange}/></td>
            </tr>
            <tr>
              <td>S3 Secret Key</td>
              <td><input value={s3SecretKey} type="text" name="s3SecretKey" onChange={this.handleInputChange}/></td>
            </tr>
            </tbody>
          </table>
          <p>
            <Button label="Copy JSON to Clipboard" onClick={this.copyJSON} />
            <Button label="Upload JSON to S3" disabled={!this.s3FeaturesAvailable} onClick={this.uploadJSONToS3}/>
            <Button label="Load JSON from S3" disabled={!this.s3FeaturesAvailable} onClick={this.loadJSONFromS3}/>
          </p>
          <div className={css.s3Status}>
            {s3Status}
          </div>
          <br/>
          <div className={css.help}>
            Note that the editor below accepts and displays JS object syntax instead of the JSON notation.
            Always use button above to copy correctly formatted JSON string.
          </div>
          <JSONEditor
            initialValue={jsonEditorContent}
            onChange={this.handleJSONChange}
            width="600px"
            height="400px"
          />
        </div>
        <div className={css.preview}>
          <h2>Preview</h2>
          <div className={css.handle}>
            <span className={icons.iconBook}/>
            <div>Glossary</div>
          </div>
          <div className={css.sidebar}>
            <GlossarySidebar
              definitions={definitions}
              learnerDefinitions={{}}
            />
          </div>
        </div>
      </div>
    );
  }

  private get s3FeaturesAvailable() {
    const { s3ActionInProgress, s3Url, s3AccessKey, s3SecretKey } = this.state;
    return !s3ActionInProgress && s3Url && s3AccessKey && s3SecretKey;
  }

  private get glossaryJSON() {
    const { glossary } = this.state;
    return JSON.stringify(glossary, null, 2);
  }

  private copyJSON = () => {
    const fakeInput = document.createElement("textarea");
    fakeInput.value = JSON.stringify(this.glossaryJSON, null, 2);
    document.body.appendChild(fakeInput);
    fakeInput.select();
    document.execCommand("copy");
    document.body.removeChild(fakeInput);
  }

  private handleInputChange = (event: React.ChangeEvent) => {
    const value = (event.target as HTMLInputElement).value;
    const name = (event.target as HTMLInputElement).name;
    switch (name) {
      case "s3Url":
        this.setState({ s3Url: value });
        localStorage.setItem(S3_URL, value);
        break;
      case "s3AccessKey":
        this.setState({ s3AccessKey: value });
        localStorage.setItem(S3_ACCESS, value);
        break;
      case "s3SecretKey":
        this.setState({ s3SecretKey: value });
        localStorage.setItem(S3_SECRET, value);
        break;
    }
  }

  // Note that this callback is executed only if there are no validation errors (syntax, schema).
  private handleJSONChange = (data: IGlossary) => {
    this.setState({ glossary: data });
  }

  private handleAskForUserDefChange = (event: React.ChangeEvent) => {
    const glossary: IGlossary = clone(this.state.glossary);
    glossary.askForUserDefinition = (event.target as HTMLInputElement).checked;
    this.setState({ glossary, jsonEditorContent: glossary });
  }

  private uploadJSONToS3 = () => {
    this.setState({
      s3ActionInProgress: true,
      s3Status: getStatusTxt("Uploading JSON to S3...")
    });
    const { s3Url, s3AccessKey, s3SecretKey } = this.state;
    s3Upload({
      url: s3Url,
      accessKey: s3AccessKey,
      secretKey: s3SecretKey,
      body: this.glossaryJSON,
      contentType: "application/json"
    }).then(() => {
      this.setState({
        s3ActionInProgress: false,
        s3Status: getStatusTxt("Uploading JSON to S3: success!")
      });
    }).catch(err => {
      this.setState({
        s3ActionInProgress: false,
        s3Status: getStatusTxt(err)
      });
    });
  }

  private loadJSONFromS3 = async () => {
    this.setState({
      s3ActionInProgress: true,
      s3Status: getStatusTxt("Loading JSON...")
    });
    const { s3Url } = this.state;
    const response = await fetch(s3Url);
    try {
      const textResponse = await response.text();
      const json = JSON.parse(textResponse);
      this.setState({
        s3ActionInProgress: false,
        s3Status: getStatusTxt("Loading JSON: success!"),
        jsonEditorContent: json
      });
    } catch (error) {
      this.setState({
        s3ActionInProgress: false,
        s3Status: getStatusTxt("Loading JSON failed: unexpected/malformed content"),
      });
    }
  }

  private toggleDefinitionEditor = (word: string) => {
    const definitionEditors = clone(this.state.definitionEditors);
    definitionEditors[word] = !definitionEditors[word];
    this.setState({ definitionEditors });
  }

  private toggleNewDef = () => {
    const { newDefEditor } = this.state;
    this.setState({ newDefEditor: !newDefEditor });
  }

  private editDef = (newDef: IWordDefinition) => {
    const glossary: IGlossary = clone(this.state.glossary);
    const definitionEditors = clone(this.state.definitionEditors);
    const existingDefIdx = glossary.definitions.map(d => d.word).indexOf(newDef.word);
    glossary.definitions.splice(existingDefIdx, 1, newDef);
    // Disable editor.
    definitionEditors[newDef.word] = false;
    this.setState({ glossary, jsonEditorContent: glossary, definitionEditors });
  }

  private addNewDef = (newDef: IWordDefinition) => {
    const glossary: IGlossary = clone(this.state.glossary);
    const definitionEditors = clone(this.state.definitionEditors);
    // If there's already definition of this word, simply remove it.
    const existingDefIdx = glossary.definitions.map(d => d.word).indexOf(newDef.word);
    if (existingDefIdx !== -1) {
      glossary.definitions.splice(existingDefIdx, 1);
    }
    glossary.definitions.push(newDef);
    // Also, if user was editing this word, make sure that we disable editor.
    definitionEditors[newDef.word] = false;
    this.setState({ glossary, jsonEditorContent: glossary, definitionEditors, newDefEditor: false});
  }

  private removeDef = (word: string) => {
    const glossary: IGlossary = clone(this.state.glossary);
    const definitionEditors = clone(this.state.definitionEditors);
    const existingDefIdx = glossary.definitions.map(d => d.word).indexOf(word);
    if (existingDefIdx !== -1) {
      glossary.definitions.splice(existingDefIdx, 1);
    }
    // Also, if user was editing this word, make sure that we disable editor (in case this word is added again later).
    definitionEditors[word] = false;
    this.setState({ glossary, jsonEditorContent: glossary, definitionEditors });
  }
}
