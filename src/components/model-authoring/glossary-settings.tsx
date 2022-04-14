import * as React from "react";
import { IGlossary, IGlossarySettings } from "../../types";
import { Panel } from "./panel";

import * as css from "./glossary-settings.scss";

interface IProps {
  name: string;
  glossary: IGlossary;
  saveSettings: (settings: IGlossarySettings) => void;
  saveName: (name: string) => void;
}

export const GlossarySettings = ({ name, glossary, saveSettings, saveName }: IProps) => {
  const { askForUserDefinition, showSideBar, autoShowMediaInPopup, enableStudentRecording, enableStudentLanguageSwitching } = glossary;

  const handleChange = (setting: keyof IGlossarySettings ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    saveSettings({...glossary, [setting]: e.target.checked});
  }

  return (
    <Panel label="Glossary Settings" collapsible={false} minHeight={500} contentClassName={css.glossarySettings}>
      <h2>Glossary Name</h2>
      <input defaultValue={name} />
      <br />
      <input type="checkbox" id="askForUserDefinition" checked={askForUserDefinition} onChange={handleChange("askForUserDefinition")} />
      <label>Require student-provided definitions</label>
      <div className="help">When this option is enabled, students will be required to submit their own
        definition before they can see the authored definition for a term.</div>
      <br />
      <input type="checkbox" id="autoShowMediaInPopup" defaultChecked={autoShowMediaInPopup} />
      <label>Automatically show media (image or video)</label>
      <div className="help">When this option is enabled, any media associated with a term will be displayed
        to the student automatically in the term popup. If both image and video are provided, students will
        only see the image automatically. If student definitions are required, students will see the video
        after their have provided their own definition. </div>
      <br />
      <input type="checkbox" id="showSideBar" defaultChecked={showSideBar} />
      <label>Show Glossary Sidebar on activity pages</label>
      <div className="help">When this option is enabled, students will have access on every page to a glossary
        of all terms in the activity via a button in the page sidebar.</div>
      <br />
      <input type="checkbox" id="enableStudentLanguageSwitching" defaultChecked={enableStudentLanguageSwitching} />
      <label>Display language switch for all students</label>
    </Panel>
  )
}