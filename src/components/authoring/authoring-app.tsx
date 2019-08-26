import * as React from "react";
import DefinitionEditor from "./definition-editor";
import Button from "../button";
import {IWordDefinition, IGlossary} from "../types";
import GlossarySidebar from "../glossary-sidebar";
import * as clone from "clone";
import { s3Upload, GLOSSARY_FILENAME } from "../../utils/s3-helpers";
import "whatwg-fetch"; // window.fetch polyfill for older browsers (IE)
import { validateGlossary } from "../../utils/validate-glossary";
import GlossaryResourceSelector from "../glossary-resource-selector";

import * as css from "./authoring-app.scss";
import * as icons from "../icons.scss";
import { TokenServiceClient } from "@concord-consortium/token-service";
import { S3Resource } from "@concord-consortium/token-service/lib/resource-types";

export const DEFAULT_GLOSSARY: IGlossary = {
  askForUserDefinition: true,
  showSideBar: true,
  definitions: []
};

interface IState {
  glossary: IGlossary;
  jsonEditorContent: object;
  newDefEditor: boolean;
  definitionEditors: {[word: string]: boolean};
  s3ActionInProgress: boolean;
  s3Status: string;
  client: TokenServiceClient | null;
  glossaryResource: S3Resource | null;
}

const getStatusTxt = (msg: string) => `[${(new Date()).toLocaleTimeString()}] ${msg}`;

export default class PluginApp extends React.Component<{}, IState> {
  public state: IState = {
    glossary: DEFAULT_GLOSSARY,
    jsonEditorContent: DEFAULT_GLOSSARY,
    newDefEditor: false,
    definitionEditors: {},
    s3ActionInProgress: false,
    s3Status: "",
    client: null,
    glossaryResource: null
  };

  public render() {
    const { newDefEditor, glossary, definitionEditors,
      s3Status, client, glossaryResource } = this.state;
    const { askForUserDefinition, definitions, showSideBar } = glossary;
    return (
      <div className={css.authoringApp}>
        <div className={css.authoringColumn}>
          <div className={css.s3Details}>
            <GlossaryResourceSelector
              inlineAuthoring={false}
              uploadJSONToS3={this.uploadJSONToS3}
              loadJSONFromS3={this.loadJSONFromS3}
              setClientAndResource={this.setClientAndResource}
            />
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
                          client={client}
                          glossaryResource={glossaryResource}
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
                client={client}
                glossaryResource={glossaryResource}
              />
            }
          </div>
        </div>
        <div className={css.preview}>
          <h2>Preview</h2>
          {showSideBar && this.renderSideBar(definitions)}
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
    this.setState({ glossary, jsonEditorContent: glossary, definitionEditors, newDefEditor: false});
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
    this.setState({ glossary, jsonEditorContent: glossary, definitionEditors });
  }

  public loadJSONFromS3 = async () => {
    const {client, glossaryResource} = this.state;
    if (!client || !glossaryResource) {
      return;
    }
    this.setState({
      s3ActionInProgress: true,
      s3Status: getStatusTxt("Loading JSON...")
    });
    const url = client.getPublicS3Url(glossaryResource, GLOSSARY_FILENAME);
    const response = await fetch(url);
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
        s3Status: getStatusTxt("Loading JSON: success!"),
        jsonEditorContent: json
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
    const {client, glossaryResource} = this.state;
    if (!client || !glossaryResource) {
      return;
    }
    this.setState({
      s3ActionInProgress: true,
      s3Status: getStatusTxt("Uploading JSON to S3...")
    });
    return client.getCredentials(glossaryResource.id)
      .then((credentials) => {
        return s3Upload({
          client,
          glossaryResource,
          credentials,
          filename: GLOSSARY_FILENAME,
          body: this.glossaryJSON,
          contentType: "application/json",
          cacheControl: "no-cache"
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
      })
      .catch((err) => {
        this.setState({
          s3ActionInProgress: false,
          s3Status: getStatusTxt(err)
        });
      });
  }

  private get glossaryJSON() {
    const { glossary } = this.state;
    return JSON.stringify(glossary, null, 2);
  }

  private copyJSON = () => {
    const fakeInput = document.createElement("textarea");
    fakeInput.value = this.glossaryJSON;
    document.body.appendChild(fakeInput);
    fakeInput.select();
    document.execCommand("copy");
    document.body.removeChild(fakeInput);
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

  private handleShowSideBarChange = (event: React.ChangeEvent) => {
    const glossary: IGlossary = clone(this.state.glossary);
    glossary.showSideBar = (event.target as HTMLInputElement).checked;
    this.setState({ glossary, jsonEditorContent: glossary });
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

  private setClientAndResource = (client: TokenServiceClient, glossaryResource: S3Resource) => {
    this.setState({client, glossaryResource});
  }
}
