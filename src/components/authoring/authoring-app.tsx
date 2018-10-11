import * as React from "react";
import DefinitionEditor from "./definition-editor";
import Button from "./button";
import {IWordDefinition, IGlossary} from "../types";
import GlossarySidebar from "../glossary-sidebar";
import JSONEditor from "./json-editor";
import * as clone from "clone";

import * as css from "./authoring-app.scss";
import * as icons from "../icons.scss";

interface IState {
  glossary: IGlossary;
  newDefEditor: boolean;
  definitionEditors: {[word: string]: boolean};
}

export default class PluginApp extends React.Component<{}, IState> {
  public state: IState = {
    glossary: {
      askForUserDefinition: true,
      definitions: []
    },
    newDefEditor: false,
    definitionEditors: {}
  };

  public render() {
    const { newDefEditor, glossary, definitionEditors } = this.state;
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
          <p><Button label="Copy JSON to Clipboard" onClick={this.copyJSON} /></p>
          <div className={css.help}>
            Note that the editor below accepts and displays JS object syntax instead of the JSON notation.
            Always use button above to copy correctly formatted JSON string.
          </div>
          <JSONEditor
            initialValue={glossary}
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

  private copyJSON = () => {
    const { glossary } = this.state;
    const fakeInput = document.createElement("textarea");
    fakeInput.value = JSON.stringify(glossary, null, 2);
    document.body.appendChild(fakeInput);
    fakeInput.select();
    document.execCommand("copy");
    document.body.removeChild(fakeInput);
  }

  private handleJSONChange = (data: IGlossary) => {
    this.setState({ glossary: data });
  }

  private handleAskForUserDefChange = (event: React.ChangeEvent) => {
    const glossary: IGlossary = clone(this.state.glossary);
    glossary.askForUserDefinition = (event.target as HTMLInputElement).checked;
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
    this.setState({ glossary, definitionEditors });
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
    this.setState({ glossary, definitionEditors, newDefEditor: false});
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
    this.setState({ glossary, definitionEditors });
  }
}
