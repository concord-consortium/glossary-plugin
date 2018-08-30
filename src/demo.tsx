import * as React from "react";
import * as ReactDOM from "react-dom";
import GlossaryPopup from "./components/glossary-popup";

// tslint:disable-next-line:no-console
const newUserDefinition = (userDefinitions: string[]) => { console.log("User definitions:", userDefinitions); };

ReactDOM.render(
  <GlossaryPopup
    word="eardrum"
    definition="An eardrum is a membrane, or thin piece of skin, stretched tight like a drum."
  />,
  document.getElementById("popup1") as HTMLElement
);

ReactDOM.render(
  <GlossaryPopup
    word="eardrum"
    definition="An eardrum is a membrane, or thin piece of skin, stretched tight like a drum."
    askForUserDefinition={true}
    onUserDefinitionsUpdate={newUserDefinition}
  />,
  document.getElementById("popup2") as HTMLElement
);
