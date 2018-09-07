import * as React from "react";
import * as ReactDOM from "react-dom";
import GlossaryPopup from "./components/glossary-popup";

import * as css from "./plugin.scss";

interface IExternalScriptContext {
  div: any;
  authoredState: any;
}
interface IWordDefintion {
  word: string;
  definition: string;
}

let PluginAPI: any;

export class GlossaryPlugin {
  private askForUserDefinition: boolean;
  private definitions: IWordDefintion[];
  private definitionsByWord: { [word: string]: IWordDefintion };

  constructor(context: IExternalScriptContext) {
    const authoredState = context.authoredState ? JSON.parse(context.authoredState) : {};
    this.askForUserDefinition = authoredState.askForUserDefinition || false;
    this.definitions = authoredState.definitions || [];
    this.definitionsByWord = {};
    this.definitions.forEach(entry => {
      this.definitionsByWord[entry.word] = entry;
    });
    if (this.definitions.length > 0) {
      this.decorate();
    }
  }

  private decorate() {
    const words = this.definitions.map(entry => entry.word);
    const replace = `<span class=${css.ccGlossaryWord}>$1</span>`;
    const listener = {
      type: "click",
      listener: this.wordClicked
    };
    PluginAPI.decorateContent(words, replace, css.ccGlossaryWord, [listener]);
  }

  private wordClicked = (evt: Event) => {
    const wordElement = evt.srcElement;
    const word = wordElement && wordElement.textContent || "";
    if (!this.definitionsByWord[word]) {
      // Ignore, nothing to do.
      return;
    }

    const container = document.createElement("div");
    ReactDOM.render(
      <GlossaryPopup
        word={word}
        definition={this.definitionsByWord[word].definition}
        askForUserDefinition={this.askForUserDefinition}
        onUserDefinitionsUpdate={this.saveUserState}
      />,
      container
    );

    PluginAPI.addPopup({
      content: container,
      title: "Glossary",
      resizable: false,
      position: { my: "left top+10", at: "left bottom", of: wordElement, collision: "flip" }
    });
  }

  private saveUserState = (userDefinitions: string[]) => {
    const userState = {
      userDefinitions
    };
    PluginAPI.saveUserState(this, JSON.stringify(userState));
  }
}

export const initPlugin = () => {
  PluginAPI = (window as any).LARA;
  if (!PluginAPI || !PluginAPI.registerPlugin) {
    // tslint:disable-next-line:no-console
    console.warn("LARA Plugin API not available, GlossaryPlugin terminating");
    return;
  }
  // tslint:disable-next-line:no-console
  console.log("LARA Plugin API available, GlossaryPlugin initialization");
  PluginAPI.registerPlugin("glossary", GlossaryPlugin);
};

initPlugin();
