import * as React from "react";
import * as ReactDOM from "react-dom";
import PluginApp from "./components/plugin-app";
import "whatwg-fetch"; // window.fetch polyfill for older browsers (IE)
import * as PluginAPI from "@concord-consortium/lara-plugin-api";
import AuthoringApp, { IGlossaryAuthoredState } from "./components/authoring/authoring-app";
import { IGlossary } from "./components/types";

const getAuthoredState = async (context: PluginAPI.IPluginRuntimeContext) => {
  if (!context.authoredState) {
    return {};
  }
  let authoredState: IGlossaryAuthoredState;
  try {
    authoredState = JSON.parse(context.authoredState);
  } catch (error) {
    // tslint:disable-next-line:no-console
    console.warn("Unexpected authoredState:", context.authoredState);
    return {};
  }
  // Authored state can contain all the necessary data already or specify only URL that points to a proper state.
  if (typeof authoredState.s3Url === "string") {
    const response = await fetch(authoredState.s3Url);
    try {
      const textResponse = await response.text();
      return JSON.parse(textResponse);
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.warn("Unexpected/malformed authoredState at URL:", authoredState.s3Url);
      return {};
    }
  } else {
    return authoredState;
  }
};

const getLearnerState = (context: PluginAPI.IPluginRuntimeContext) => {
  const fallbackLearnerState = { definitions: {} };
  if (!context.learnerState) {
    return fallbackLearnerState;
  }
  try {
    return JSON.parse(context.learnerState);
  } catch (error) {
    // tslint:disable-next-line:no-console
    console.warn("Unexpected learnerState:", context.learnerState);
    return fallbackLearnerState;
  }
};

export class GlossaryPlugin {
  public context: PluginAPI.IPluginRuntimeContext;
  public pluginAppComponent: any;

  constructor(context: PluginAPI.IPluginRuntimeContext) {
    this.context = context;
    // Note renderPluginApp is an async function. Constructor can't be async, as it needs to return immediately.
    // It also means that component won't be rendered immediately. That's fine.
    this.renderPluginApp();
  }

  // This method is public so tests can call it directly and wait for it to finish.
  // Note that in such case it will be called twice - by constructor and by test code directly.
  // It needs to be idempotent.
  public renderPluginApp = async () => {
    const authoredState: IGlossary = await getAuthoredState(this.context);
    const definitions = authoredState.definitions || [];
    const showSideBar = authoredState.showSideBar || false;
    const askForUserDefinition = authoredState.askForUserDefinition || false;
    const autoShowMediaInPopup = authoredState.autoShowMediaInPopup || false;
    const initialLearnerState = getLearnerState(this.context);

    if (this.pluginAppComponent) {
      ReactDOM.unmountComponentAtNode(this.context.container);
      this.pluginAppComponent = undefined;
    }

    this.pluginAppComponent = ReactDOM.render(
      <PluginApp
        saveState={this.context.saveLearnerPluginState}
        definitions={definitions}
        initialLearnerState={initialLearnerState}
        askForUserDefinition={askForUserDefinition}
        autoShowMediaInPopup={autoShowMediaInPopup}
        showSideBar={showSideBar}
      />,
      // It can be any other element in the document. Note that PluginApp render everything using React Portals.
      // It renders child components into external containers sent to LARA, not into context.div
      // or anything else that we provide here.
      this.context.container);
  }
}

export class GlossaryAuthoringPlugin {
  public context: PluginAPI.IPluginAuthoringContext;
  public pluginAppComponent: any;

  constructor(context: PluginAPI.IPluginAuthoringContext) {
    this.context = context;
    this.renderPluginApp();
  }

  // This method is public so tests can call it directly and wait for it to finish.
  // Note that in such case it will be called twice - by constructor and by test code directly.
  // It needs to be idempotent.
  public renderPluginApp = () => {
    const authoredState: IGlossaryAuthoredState =
      this.context.authoredState ? JSON.parse(this.context.authoredState) : {};

    this.pluginAppComponent = ReactDOM.render(
      <AuthoringApp
        inlineAuthoring={{
          authoredState,
          saveAuthoredPluginState: this.context.saveAuthoredPluginState,
        }}
        getFirebaseJwt={this.context.getFirebaseJwt}
      />,
      this.context.container);
  }
}

export const initPlugin = () => {
  if (!PluginAPI || !PluginAPI.registerPlugin) {
    // tslint:disable-next-line:no-console
    console.warn("LARA Plugin API not available, GlossaryPlugin terminating");
    return;
  }
  // tslint:disable-next-line:no-console
  console.log("LARA Plugin API available, GlossaryPlugin initialization");
  PluginAPI.registerPlugin({
    runtimeClass: GlossaryPlugin,
    authoringClass: GlossaryAuthoringPlugin
  });
};

initPlugin();
