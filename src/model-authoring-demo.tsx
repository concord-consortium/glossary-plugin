import * as React from "react";
import * as ReactDOM from "react-dom";
import ModelAuthoringApp from "./components/model-authoring/model-authoring-app";
import { saveInDemo } from "./components/model-authoring/params";
import { demoGlossaryJSONKey, demoGlossaryNameKey } from "./hooks/use-save";
import { IGlossaryModelAuthoringInitialData } from "./types";

let initialData: IGlossaryModelAuthoringInitialData = {
  name: "Demo Glossary",
  json: {
    askForUserDefinition: true,
    showSideBar: true,
    definitions: [],
    autoShowMediaInPopup: true,
    enableStudentRecording: true,
    enableStudentLanguageSwitching: true,
    translations: {}
  }
};

// merge in any saved demo data
if (saveInDemo) {
  const savedDemoGlossaryJSON = localStorage.getItem(demoGlossaryJSONKey);
  const savedDemoGlossaryName = localStorage.getItem(demoGlossaryNameKey);

  if (savedDemoGlossaryJSON) {
    initialData = {...initialData, json: JSON.parse(savedDemoGlossaryJSON)};
  }
  if (savedDemoGlossaryName) {
    initialData = {...initialData, name: savedDemoGlossaryName};
  }
}

const ModelAuthoringDemo = () => {
  return (
    <div>
      <div style={{backgroundColor: "#777", color: "#fff", padding: 5, marginBottom: 5, textAlign: "center"}}>
        This is a demo of the glossary model authoring.  No data is being saved.
      </div>
      <ModelAuthoringApp demo={true} initialData={initialData} />
    </div>
  )
}

ReactDOM.render(<ModelAuthoringDemo />, document.getElementById("app") as HTMLElement);