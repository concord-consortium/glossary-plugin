import * as React from "react";
import * as ReactDOM from "react-dom";
import GlossaryPopup from "./components/glossary-popup";

interface IExternalScriptContext {
  div: any;
}

const PluginAPI = (window as any).LARA;

export class GlossaryPlugin {
  constructor(authoredState: any, context: IExternalScriptContext) {
    const container = document.createElement("div");
    ReactDOM.render(
      <GlossaryPopup
        word="eardrum"
        definition="An eardrum is a membrane, or thin piece of skin, stretched tight like a drum."
        askForUserDefinition={true}
        onUserDefinitionsUpdate={this.saveUserState}
      />,
      container
    );
    PluginAPI.openPopup({
      content: container,
      title: "Glossary",
      resizable: false
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
  // TODO soon it will be replaced with window.LARA. For now use legacy ExternalScripts api to register.
  const OldPluginAPI = (window as any).ExternalScripts;
  if (!OldPluginAPI) {
    // LARA Plugin API not available. Nothing to do.
    return;
  }

  // tslint:disable-next-line:no-console
  console.log("LARA Plugin API available, GlossaryPlugin initialization");
  OldPluginAPI.register("glossary", GlossaryPlugin);
};

initPlugin();
