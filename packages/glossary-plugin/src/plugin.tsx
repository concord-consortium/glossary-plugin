import * as React from "react";
import * as ReactDOM from "react-dom";
import PluginApp from "./components/plugin-app";

interface IExternalScriptContext {
  div: any;
  authoredState: string;
  learnerState: string;
  pluginId: string;
}

let PluginAPI: any;

const fallbackLearnerState = { definitions: {} };

export class GlossaryPlugin {
  public pluginAppComponent: any;

  constructor(context: IExternalScriptContext) {
    let authoredState;
    if (!context.authoredState) {
      authoredState = {};
    } else {
      try {
        authoredState = JSON.parse(context.authoredState);
      } catch (error) {
        // tslint:disable-next-line:no-console
        console.warn("Unexpected authoredState:", context.authoredState);
        authoredState = {};
      }
    }
    const definitions = authoredState.definitions || [];
    const askForUserDefinition = authoredState.askForUserDefinition || false;
    let initialLearnerState;
    if (!context.learnerState) {
      initialLearnerState = fallbackLearnerState;
    } else {
      try {
        initialLearnerState = JSON.parse(context.learnerState);
      } catch (error) {
        // tslint:disable-next-line:no-console
        console.warn("Unexpected learnerState:", context.learnerState);
        initialLearnerState = fallbackLearnerState;
      }
    }

    this.pluginAppComponent = ReactDOM.render(
      <PluginApp
        PluginAPI={PluginAPI}
        pluginId={context.pluginId}
        definitions={definitions}
        initialLearnerState={initialLearnerState}
        askForUserDefinition={askForUserDefinition}
      />,
      // It can be any other element in the document. Note that PluginApp render everything using React Portals.
      // It renders child components into external containers sent to LARA, not into context.div
      // or anything else that we provide here.
      context.div);
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
