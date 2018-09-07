import * as React from "react";
import * as ReactDOM from "react-dom";
import PluginApp from "./components/plugin-app";

interface IExternalScriptContext {
  div: any;
  authoredState: any;
  learnerState: any;
}

let PluginAPI: any;

export class GlossaryPlugin {
  constructor(context: IExternalScriptContext) {
    const authoredState = context.authoredState ? JSON.parse(context.authoredState) : {};
    const definitions = authoredState.definitions || [];
    const askForUserDefinition = authoredState.askForUserDefinition || false;
    const initialLearnerState = context.learnerState || { definitions: {} };

    ReactDOM.render(
      <PluginApp
        PluginAPI={PluginAPI}
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
