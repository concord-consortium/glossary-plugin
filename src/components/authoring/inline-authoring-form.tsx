import * as React from "react";
import DefinitionEditor from "./definition-editor";
import Button from "./button";
import {IWordDefinition, IGlossary} from "../types";
import GlossarySidebar from "../glossary-sidebar";
import * as clone from "clone";
import { s3Upload, s3Url, parseS3Url } from "../../utils/s3-helpers";
import "whatwg-fetch"; // window.fetch polyfill for older browsers (IE)
import { validateGlossary } from "../../utils/validate-glossary";

import * as css from "./authoring-app.scss";
import * as icons from "../icons.scss";

export const DEFAULT_GLOSSARY: IGlossary = {
  askForUserDefinition: true,
  showSideBar: false,
  definitions: []
};
// Keys used to obtain dat from URL or local storage.
const GLOSSARY_NAME = "glossaryName";
const USERNAME = "username";
const S3_ACCESS = "s3AccessKey";
const S3_SECRET = "s3SecretKey";

interface IProps {
  s3Url: string;
  saveAuthoredPluginState: (json: string) => void;
}

interface IState {
  glossary: IGlossary;
  newDefEditor: boolean;
  definitionEditors: {[word: string]: boolean};
  glossaryName: string;
  username: string;
  s3AccessKey: string;
  s3SecretKey: string;
  s3ActionInProgress: boolean;
  s3Status: string;
  glossaryDirty: boolean;
}

const getStatusTxt = (msg: string) => `[${(new Date()).toLocaleTimeString()}] ${msg}`;

export default class InlineAuthoringForm extends React.Component<IProps, IState> {

  constructor(props: IProps) {
    super(props);

    let glossaryName = "";
    let username = "";

    if (props.s3Url) {
      const {dir, filename} = parseS3Url(props.s3Url);
      username = dir ? dir : "";
      glossaryName = filename ? filename : "";
    }

    this.state = {
      glossary: DEFAULT_GLOSSARY,
      glossaryName,
      username,
      newDefEditor: false,
      definitionEditors: {},
      s3AccessKey: localStorage.getItem(S3_ACCESS) || "",
      s3SecretKey: "",
      s3ActionInProgress: false,
      s3Status: "",
      glossaryDirty: false
    };
  }

  public componentDidMount() {
    if (this.s3LoadFeaturesAvailable) {
      this.loadJSONFromS3();
    }
  }

  public render() {
    const { glossary, newDefEditor, definitionEditors,
      glossaryName, username, s3AccessKey, s3SecretKey, s3Status, glossaryDirty } = this.state;
    const { askForUserDefinition, definitions, showSideBar} = glossary;
    return (
      <div className={`${css.authoringApp} ${css.inlineAuthoring}`}>
        <div className={css.scrollForm}>
          <div className={css.authoringColumn}>
            <div className={css.s3Details}>
              <table>
                <tbody>
                <tr className={css.name}>
                  <td>Glossary Name</td>
                  <td>
                    <input
                      value={glossaryName}
                      type="text"
                      name="glossaryName"
                      onChange={this.handleInputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Username</td>
                  <td><input value={username} type="text" name="username" onChange={this.handleInputChange}/></td>
                </tr>
                <tr>
                  <td>S3 Access Key</td>
                  <td>
                    <input
                      value={s3AccessKey}
                      type="text"
                      name="s3AccessKey"
                      autoComplete="glossary-s3AccessKey"
                      onChange={this.handleInputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <td>S3 Secret Key</td>
                  <td><input value={s3SecretKey} type="text" name="s3SecretKey" onChange={this.handleInputChange}/></td>
                </tr>
                </tbody>
              </table>
              <p>
                <Button
                  label="Save"
                  disabled={!this.s3SaveFeaturesAvailable}
                  data-cy="save"
                  onClick={this.uploadJSONToS3}
                />
                <Button
                  label="Load"
                  disabled={!this.s3LoadFeaturesAvailable}
                  data-cy="load"
                  onClick={this.loadJSONFromS3}
                />
              </p>
              <div className={css.s3Status}>
                {s3Status}
              </div>
            </div>
            <div className={css.authoring}>
              <input
                type="checkbox"
                checked={askForUserDefinition}
                data-cy="askForUserChange"
                onChange={this.handleAskForUserDefChange}
              />
              <label>
                Ask students for definition
                <div className={css.help}>
                  When this option is turned on, students will have to provide their own definition
                  before they can see an authored one.
                </div>
              </label>
              <br/>
              <input
                type="checkbox"
                checked={showSideBar}
                data-cy="showSideBar"
                onChange={this.handleShowSideBarChange}
              />
              <label>
                Show Glossary icon in sidebar
                <div className={css.help}>
                  When this option is turned on, students will have access to
                  the glossary at all times via the sidebar.
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
                            username={username}
                            s3AccessKey={s3AccessKey}
                            s3SecretKey={s3SecretKey}
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
              {
                !newDefEditor &&
                <Button icon="iconPlus" label="Add a new definition" data-cy="addDef" onClick={this.toggleNewDef}/>
              }
              {
                newDefEditor &&
                <DefinitionEditor
                  onCancel={this.toggleNewDef}
                  onSave={this.addNewDef}
                  username={username}
                  s3AccessKey={s3AccessKey}
                  s3SecretKey={s3SecretKey}
                />
              }
            </div>
          </div>
          <div className={css.preview}>
            <h2>Preview</h2>
            {showSideBar && this.renderSideBar(definitions)}
          </div>
        </div>
        <div>
          <hr />
          { glossaryDirty &&
            <div className={css.warning}>
              You've made changes to a remote glossary. Remember to save them to S3 using the buttons at the top
              before pressing Save on this form.
            </div>
          }
          <div className={css.inlineFormButtons}>
            <button onClick={this.saveAuthoredState} className="embeddable-save">Save</button>
            <button className="close">Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  public renderSideBar(definitions: IWordDefinition[]) {
    return(
      <div>
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
    );
  }
  public get glossaryFileName() {
    const { glossaryName } = this.state;
    return glossaryName.endsWith(".json") ? glossaryName : `${glossaryName}.json`;
  }

  public addNewDef = (newDef: IWordDefinition) => {
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
    this.setState({ glossary, definitionEditors, newDefEditor: false, glossaryDirty: this.s3LoadFeaturesAvailable});
  }

  public removeDef = (word: string) => {
    const glossary: IGlossary = clone(this.state.glossary);
    const definitionEditors = clone(this.state.definitionEditors);
    const existingDefIdx = glossary.definitions.map(d => d.word).indexOf(word);
    if (existingDefIdx !== -1) {
      glossary.definitions.splice(existingDefIdx, 1);
    }
    // Also, if user was editing this word, make sure that we disable editor (in case this word is added again later).
    definitionEditors[word] = false;
    this.setState({ glossary, definitionEditors, glossaryDirty: this.s3LoadFeaturesAvailable });
  }

  public loadJSONFromS3 = async () => {
    const { username } = this.state;
    this.setState({
      s3ActionInProgress: true,
      s3Status: getStatusTxt("Loading JSON...")
    });
    const response = await fetch(s3Url({ dir: username, filename: this.glossaryFileName }));
    if (response.status !== 200) {
      this.setState({
        s3ActionInProgress: false,
        s3Status: getStatusTxt("Loading JSON failed" )
      });
      return;
    }
    try {
      const textResponse = await response.text();
      const json = JSON.parse(textResponse);
      this.setState({
        s3ActionInProgress: false,
        s3Status: getStatusTxt("Loading JSON: success!")
      });
      // Update glossary definition only if it's valid. Otherwise, only JSON editor is updated and
      // an author can fix possible errors.
      if (validateGlossary(json).valid) {
        this.setState({
          glossary: json
        });
      }
    } catch (error) {
      this.setState({
        s3ActionInProgress: false,
        s3Status: getStatusTxt("Loading JSON failed: unexpected/malformed content")
      });
    }
  }

  public uploadJSONToS3 = () => {
    const { username } = this.state;
    this.setState({
      s3ActionInProgress: true,
      s3Status: getStatusTxt("Uploading JSON to S3...")
    });
    const { s3AccessKey, s3SecretKey } = this.state;
    s3Upload({
      dir: username,
      filename: this.glossaryFileName,
      accessKey: s3AccessKey,
      secretKey: s3SecretKey,
      body: this.glossaryJSON,
      contentType: "application/json",
      cacheControl: "no-cache"
    }).then(() => {
      this.setState({
        s3ActionInProgress: false,
        s3Status: getStatusTxt("Uploading JSON to S3: success!"),
        glossaryDirty: false
      });
    }).catch(err => {
      this.setState({
        s3ActionInProgress: false,
        s3Status: getStatusTxt(err)
      });
    });
  }

  private get s3LoadFeaturesAvailable() {
    const { s3ActionInProgress, glossaryName, username } = this.state;
    return !!(!s3ActionInProgress && glossaryName && username);
  }

  private get s3SaveFeaturesAvailable() {
    const { s3ActionInProgress, glossaryName, username, s3AccessKey, s3SecretKey } = this.state;
    return !!(!s3ActionInProgress && glossaryName && username && s3AccessKey && s3SecretKey);
  }

  private get glossaryJSON() {
    const { glossary } = this.state;
    return JSON.stringify(glossary, null, 2);
  }

  private get LARAPluginState() {
    const { username } = this.state;
    return JSON.stringify({ url: s3Url({filename: this.glossaryFileName, dir: username })}, null, 2);
  }

  private copyJSON = () => {
    const fakeInput = document.createElement("textarea");
    fakeInput.value = this.glossaryJSON;
    document.body.appendChild(fakeInput);
    fakeInput.select();
    document.execCommand("copy");
    document.body.removeChild(fakeInput);
  }

  private handleInputChange = (event: React.ChangeEvent) => {
    const value = (event.target as HTMLInputElement).value;
    const name = (event.target as HTMLInputElement).name;
    switch (name) {
      case "glossaryName":
        this.setState({ glossaryName: value });
        localStorage.setItem(GLOSSARY_NAME, value);
        break;
      case "username":
        this.setState({ username: value });
        localStorage.setItem(USERNAME, value);
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
    this.setState({ glossary });
  }

  private handleShowSideBarChange = (event: React.ChangeEvent) => {
    const glossary: IGlossary = clone(this.state.glossary);
    glossary.showSideBar = (event.target as HTMLInputElement).checked;
    this.setState({ glossary });
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
    this.setState({ glossary, definitionEditors, glossaryDirty: this.s3LoadFeaturesAvailable });
  }

  private saveAuthoredState = () => {
    const { username, glossaryName } = this.state;
    const glossaryFileName = glossaryName + ".json";
    this.props.saveAuthoredPluginState(JSON.stringify({
      url: s3Url({filename: glossaryFileName, dir: username })
    }));
  }
}
