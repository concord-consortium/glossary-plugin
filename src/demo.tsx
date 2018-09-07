import * as React from "react";
import * as ReactDOM from "react-dom";
import GlossaryPopup from "./components/glossary-popup";

// tslint:disable-next-line:no-console
const newUserDefinition = (userDefinition: string) => { console.log("User definition:", userDefinition); };

ReactDOM.render(
  <GlossaryPopup
    word="eardrum"
    definition="An eardrum is a membrane, or thin piece of skin, stretched tight like a drum."
    userDefinitions={[]}
  />,
  document.getElementById("popup1") as HTMLElement
);

ReactDOM.render(
  <GlossaryPopup
    word="eardrum"
    definition="An eardrum is a membrane, or thin piece of skin, stretched tight like a drum."
    userDefinitions={["I don't know"]}
    askForUserDefinition={true}
    onUserDefinitionsUpdate={newUserDefinition}
  />,
  document.getElementById("popup2") as HTMLElement
);
