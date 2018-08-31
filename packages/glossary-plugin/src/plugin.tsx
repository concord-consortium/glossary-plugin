import * as React from "react";
import * as ReactDOM from "react-dom";
import GlossaryPopup from "./components/glossary-popup";

interface IExternalScriptContext {
  div: any;
}

class GlossaryPlugin {
  constructor(authoredState: any, context: IExternalScriptContext) {
    const div = document.getElementById(context.div.selector);
    // div itself is hidden, so go higher up. It's just a little hack to present rendering,
    // not going to be used later.
    const container = div && div.parentElement && div.parentElement.parentElement;

    ReactDOM.render(
      <GlossaryPopup
        word="eardrum"
        definition="An eardrum is a membrane, or thin piece of skin, stretched tight like a drum."
        askForUserDefinition={true}
      />,
      container
    );
  }
}

// Init
(() => {
  const PluginAPI = (window as any).ExternalScripts;
  if (!PluginAPI) {
    // LARA Plugin API not available. Nothing to do.
    return;
  }

  // tslint:disable-next-line:no-console
  console.log("LARA Plugin API available, GlossaryPlugin initialization");
  PluginAPI.register("glossary", GlossaryPlugin);
})();
