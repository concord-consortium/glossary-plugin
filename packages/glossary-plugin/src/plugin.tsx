import * as React from "react";
import * as ReactDOM from "react-dom";
import GlossaryPopup from "./components/glossary-popup";

interface IExternalScriptContext {
  div: any;
  authoredState: any;
}
interface IWordDefintion {
  word: string;
  definition: string;
}
const PluginAPI = (window as any).LARA;

export class GlossaryPlugin {
  private definitions: IWordDefintion[];
  constructor(label: string, context: IExternalScriptContext) {
    const container = document.createElement("div");
    const authoredState = context.authoredState ? JSON.parse(context.authoredState) : {};
    this.definitions = authoredState.definitions ? authoredState.definitions : [{
      word: "eardrum",
      definition: "An eardrum is a membrane, or thin piece of skin, stretched tight like a drum."
    }];
    ReactDOM.render(
      <GlossaryPopup
        word="eardrum"
        definition="An eardrum is a membrane, or thin piece of skin, stretched tight like a drum."
        askForUserDefinition={true}
        onUserDefinitionsUpdate={this.saveUserState}
      />,
      container
    );
    PluginAPI.addPopup({
      content: container,
      title: "Glossary",
      resizable: false
    });
    this.decorate();
  }

  private decorate() {
    const words = this.definitions.map( (entry) => entry.word);
    const replace = "<span style='text-decoration: underline;'>$1</span>";
    const wordClass = "cc-glossary-word";
    const listener = {
      type: "click",
      listener: (evt: any) => {
        const container = document.createElement("div");
        // TODO: figure out what word we clicked …
        ReactDOM.render(
          <GlossaryPopup
            word="eardrum"
            definition="An eardrum is a membrane, or thin piece of skin, stretched tight like a drum."
            askForUserDefinition={true}
            onUserDefinitionsUpdate={this.saveUserState}
          />,
          container
        );
        PluginAPI.addPopup({
          content: container,
          title: "Glossary",
          resizable: false
        });
      }
    };
    PluginAPI.decorateContent(words, replace, wordClass, [listener]);
  }

  private saveUserState = (userDefinitions: string[]) => {
    const userState = {
      userDefinitions
    };
    PluginAPI.saveUserState(this, JSON.stringify(userState));
  }

}

const oldInit = () => {
  // TODO soon it will be replaced with window.LARA. For now use legacy ExternalScripts api to register.
  const OldPluginAPI = (window as any).ExternalScripts;
  if (!OldPluginAPI) {
    // LARA Plugin API not available. Nothing to do.
    return;
  }

  // tslint:disable-next-line:no-console
  console.log("OLD External Script Plugin API available, GlossaryPlugin initialization");
  OldPluginAPI.register("glossary", GlossaryPlugin);
};

export const initPlugin = () => {
  if (!PluginAPI.registerPlugin) {
    // tslint:disable-next-line:no-console
    console.error("LARA Plugin API not available, GlossaryPlugin terminating");
    return;
  }
  // tslint:disable-next-line:no-console
  console.log("LARA Plugin API available, GlossaryPlugin initialization");
  PluginAPI.registerPlugin("glossary", GlossaryPlugin);
};

initPlugin();
