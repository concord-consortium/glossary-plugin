import * as React from "react";
import * as ReactDOM from "react-dom";
import GlossaryPopup from "./glossary-popup";

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(<GlossaryPopup word="test" definition="test definition" userDefinitions={[]} askForUserDefinition={false} />, div);
  ReactDOM.unmountComponentAtNode(div);
});
