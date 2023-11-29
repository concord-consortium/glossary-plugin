import * as React from "react";
import * as ReactDOM from "react-dom";
import ModelAuthoringApp from "./components/model-authoring/model-authoring-app";
import { saveInDemo } from "./components/model-authoring/params";
import { demoGlossary } from "./components/model-authoring/demo-glossary";
import { demoGlossaryJSONKey, demoGlossaryNameKey, demoGlossaryProjectKey } from "./hooks/use-save";

let initialData = demoGlossary;

// merge in any saved demo data
if (saveInDemo) {
  const savedDemoGlossaryJSON = localStorage.getItem(demoGlossaryJSONKey);
  const savedDemoGlossaryName = localStorage.getItem(demoGlossaryNameKey);
  const savedDemoGlossaryProject = localStorage.getItem(demoGlossaryProjectKey);

  if (savedDemoGlossaryJSON) {
    initialData = {...initialData, json: JSON.parse(savedDemoGlossaryJSON)};
  }
  if (savedDemoGlossaryName) {
    initialData = {...initialData, name: savedDemoGlossaryName};
  }
  if (savedDemoGlossaryProject) {
    initialData = {...initialData, project: JSON.parse(savedDemoGlossaryProject)};
  }
}

const ModelAuthoringDemo = () => {
  return (
    <div>
      <div style={{backgroundColor: "#777", color: "#fff", padding: 5, marginBottom: 5, textAlign: "center"}}>
        This is a demo of the glossary model authoring.  {saveInDemo ? "Data is being saved to local storage due to saveInDemo parameter." : "No data is being saved."}
      </div>
      <ModelAuthoringApp demo={true} initialData={initialData} />
    </div>
  )
}

ReactDOM.render(<ModelAuthoringDemo />, document.getElementById("app") as HTMLElement);