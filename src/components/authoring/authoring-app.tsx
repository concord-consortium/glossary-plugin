import * as React from "react";
import DefinitionEditor from "./definition-editor";
import Button from "../common/button";
import {IWordDefinition, IGlossary} from "../../types";
import GlossarySidebar from "../plugin/glossary-sidebar";
import TranslationsPanel from "./translations-panel";
import * as clone from "clone";
import { s3Upload, GLOSSARY_FILENAME } from "../../utils/s3-helpers";
import "whatwg-fetch"; // window.fetch polyfill for older browsers (IE)
import { validateGlossary } from "../../utils/validate-glossary";
import { TokenServiceClient, S3Resource } from "@concord-consortium/token-service";
import GlossaryResourceSelector from "./glossary-resource-selector";
import { IJwtResponse } from "@concord-consortium/lara-plugin-api";
import { GLOSSARY_URL_PARAM } from "../../utils/get-url-param";
import * as css from "./authoring-app.scss";
import * as icons from "../common/icons.scss";
import ensureCorrectProtocol from "../../utils/ensure-correct-protocol";

export const DEFAULT_GLOSSARY: IGlossary = {
  askForUserDefinition: true,
  autoShowMediaInPopup: false,
  showSideBar: false,
  disableReadAloud: false,
  showIDontKnowButton: false,
  enableStudentRecording: false,
  enableStudentLanguageSwitching: false,
  showSecondLanguageFirst: false,
  definitions: []
};

export interface IGlossaryAuthoredState {
  version: "1.0"; // versioning for future use
  glossaryResourceId?: string | null;
  s3Url?: string | null; // renamed from url to ensure older authored states are not loaded
}

interface IInlineAuthoringProps {
  authoredState: IGlossaryAuthoredState;
  saveAuthoredPluginState: (json: string) => void;
}

interface IStandaloneAuthoringProps {
  glossaryResourceId?: string | null;
}

interface IProps {
  inlineAuthoring?: IInlineAuthoringProps;
  standaloneAuthoring?: IStandaloneAuthoringProps;
  getFirebaseJwt?: (appName: string) => Promise<IJwtResponse>;
}

interface IState {
  glossary: IGlossary;
  newDefEditor: boolean;
  definitionEditors: {[word: string]: boolean};
  s3ActionInProgress: boolean;
  s3Status: string;
  glossaryDirty: boolean;
  client: TokenServiceClient | null;
  glossaryResource: S3Resource | null;
  publicGlossaryUrl: string | null;
}

const getStatusTxt = (msg: string) => `[${(new Date()).toLocaleTimeString()}] ${msg}`;

export default class AuthoringApp extends React.Component<IProps, IState> {
  public state: IState = {
    glossary: DEFAULT_GLOSSARY,
    newDefEditor: false,
    definitionEditors: {},
    s3ActionInProgress: false,
    s3Status: "",
    glossaryDirty: false,
    client: null,
    glossaryResource: null,
    publicGlossaryUrl: null,
  };

  get glossaryResourceId() {
    const { inlineAuthoring, standaloneAuthoring } = this.props;
    if (inlineAuthoring) {
      return inlineAuthoring.authoredState && inlineAuthoring.authoredState.glossaryResourceId;
    }
    if (standaloneAuthoring) {
      return standaloneAuthoring.glossaryResourceId;
    }
  }

  get inlineMode() {
    return !!this.props.inlineAuthoring;
  }

  public render() {
    const { glossary, newDefEditor, definitionEditors, s3Status, glossaryDirty, client, glossaryResource } = this.state;
    const { getFirebaseJwt } = this.props;
    const { askForUserDefinition, autoShowMediaInPopup, definitions,
            showSideBar, enableStudentRecording, enableStudentLanguageSwitching, disableReadAloud } = glossary;
    return (
      <div className={css.authoringApp}>
        <div className={`${this.inlineMode ? css.inlineScrollForm : ""}`}>
          <div className={css.authoringColumn}>
            <div className={css.s3Details}>
              <GlossaryResourceSelector
                glossaryResourceId={this.glossaryResourceId}
                uploadJSONToS3={this.uploadJSONToS3}
                loadJSONFromS3={this.loadJSONFromS3}
                setClientAndResource={this.setClientAndResource}
                getFirebaseJwt={getFirebaseJwt}
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
              <br/>
              <input
                type="checkbox"
                checked={autoShowMediaInPopup}
                data-cy="autoShowMediaInPopup"
                onChange={this.handleAutoShowMediaInPopupChange}
              />
              <label>
                Automatically show media (image or video) in definition popup
                <div className={css.help}>
                  When this option is turned on, students will automatically see provided image or video. If both
                  image and video are provided, students will see the image.
                </div>
              </label>
              <br/>
              <input
                type="checkbox"
                checked={enableStudentRecording}
                data-cy="enableStudentRecording"
                onChange={this.handleEnableStudentRecordingChange}
              />
              <label>
                Enable student recording in definition popup
                <div className={css.help}>
                  When this option is turned on, teachers will have the option to enable students to record
                  definitions in the popup.  Teachers must further enable this per student in their dashboard.
                </div>
              </label>
              <br/>
              <input
                type="checkbox"
                checked={enableStudentLanguageSwitching}
                data-cy="enableStudentLanguageSwitching"
                onChange={this.handleEnableStudentLanguageSwitching}
              />
              <label>
                Enable students to switch between languages
                <div className={css.help}>
                  When this option is turned on, students will have the option to switch between languages
                  if there are translations defined in the glossary.  <strong>NOTE</strong>: this will disable the
                  ability of a teacher to select a secondary language for a student in the glossary dashboard.
                </div>
              </label>
              <br/>
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
            <TranslationsPanel glossary={glossary} onGlossaryUpdate={this.saveGlossary} />
          </div>
          {this.renderDashboardUrlParams()}
          <div className={css.preview}>
            <h2>Preview</h2>
            {showSideBar && this.renderSideBar(definitions, disableReadAloud)}
          </div>
        </div>
        {
          this.inlineMode &&
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
        }
      </div>
    );
  }

  public renderDashboardUrlParams() {
    const {publicGlossaryUrl} = this.state;
    if (publicGlossaryUrl) {
      return(
        <div className={css.dashboardUrlParams}>
          Add this param to your glossary dashboard report url:
          <div data-cy="S3Url" className={css.s3url}>
            #{GLOSSARY_URL_PARAM}={encodeURIComponent(publicGlossaryUrl)}
          </div>
        </div>
      );
    }
  }

  public renderSideBar(definitions: IWordDefinition[], disableReadAloud: boolean) {

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
            disableReadAloud={disableReadAloud}
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
    const {client, glossaryResource} = this.state;
    if (!client || !glossaryResource) {
      return;
    }
    const url = client.getPublicS3Url(glossaryResource, GLOSSARY_FILENAME);
    this.setState({
      publicGlossaryUrl: url,
      s3ActionInProgress: true,
      s3Status: getStatusTxt("Loading JSON...")
    });

    const response = await fetch(ensureCorrectProtocol(url));
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
        }).then((url: string) => {
          this.setState({
            publicGlossaryUrl: url,
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

  private get s3LoadFeaturesAvailable() {
    const { s3ActionInProgress, client, glossaryResource } = this.state;
    return !!(!s3ActionInProgress && client && glossaryResource);
  }

  private get glossaryJSON() {
    const { glossary } = this.state;
    return JSON.stringify(glossary, null, 2);
  }

  private handleAskForUserDefChange = (event: React.ChangeEvent) => {
    const glossary: IGlossary = clone(this.state.glossary);
    glossary.askForUserDefinition = (event.target as HTMLInputElement).checked;
    this.setState({ glossary });
  }

  private handleAutoShowMediaInPopupChange = (event: React.ChangeEvent) => {
    const glossary: IGlossary = clone(this.state.glossary);
    glossary.autoShowMediaInPopup = (event.target as HTMLInputElement).checked;
    this.setState({ glossary });
  }

  private handleShowSideBarChange = (event: React.ChangeEvent) => {
    const glossary: IGlossary = clone(this.state.glossary);
    glossary.showSideBar = (event.target as HTMLInputElement).checked;
    this.setState({ glossary });
  }

  private handleEnableStudentRecordingChange = (event: React.ChangeEvent) => {
    const glossary: IGlossary = clone(this.state.glossary);
    glossary.enableStudentRecording = (event.target as HTMLInputElement).checked;
    this.setState({ glossary });
  }

  private handleEnableStudentLanguageSwitching = (event: React.ChangeEvent) => {
    const glossary: IGlossary = clone(this.state.glossary);
    glossary.enableStudentLanguageSwitching = (event.target as HTMLInputElement).checked;
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

  private saveGlossary = (newGlossary: IGlossary) => {
    this.setState({ glossary: newGlossary, glossaryDirty: this.s3LoadFeaturesAvailable });
  }

  private saveAuthoredState = () => {
    if (!this.props.inlineAuthoring) {
      return;
    }
    const { glossaryResource, client } = this.state;
    const version = "1.0";
    const glossaryResourceId = glossaryResource ? glossaryResource.id : null;
    const s3Url = client && glossaryResource ? client.getPublicS3Url(glossaryResource, GLOSSARY_FILENAME) : null;
    const authoredState: IGlossaryAuthoredState = { version, glossaryResourceId, s3Url };
    this.props.inlineAuthoring.saveAuthoredPluginState(JSON.stringify(authoredState));
  }

  private setClientAndResource = (client: TokenServiceClient, glossaryResource: S3Resource) => {
    return new Promise<void>((resolve, reject) => {
      this.setState({client, glossaryResource}, () => resolve());
    });
  }
}
