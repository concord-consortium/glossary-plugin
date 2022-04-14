import * as React from "react";
import { useState } from "react";

import { IGlossary, IGlossarySettings } from "../../types";
import { Panel } from "./panel";
import { EditName } from "./edit-name";

import * as css from "./glossary-settings.scss";

interface IProps {
  name: string;
  glossary: IGlossary;
  saveSettings: (settings: IGlossarySettings) => void;
  saveName: (name: string) => void;
}

export const GlossarySettings = ({ name, glossary, saveSettings, saveName }: IProps) => {
  const { askForUserDefinition, showSideBar, autoShowMediaInPopup,  enableStudentRecording, enableStudentLanguageSwitching } = glossary;
  const [enabled, setEnabled] = useState<boolean>(askForUserDefinition);

  const handleUserDefinitionChange = () => (e: React.ChangeEvent<HTMLInputElement>) => {
    setEnabled(e.target.checked);
    if (!e.target.checked){
      saveSettings({...glossary, "askForUserDefinition": false, "enableStudentRecording": false})
    } else {
      saveSettings({...glossary, "askForUserDefinition": e.target.checked})
    }
  }

  const handleChange = (setting: keyof IGlossarySettings ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    saveSettings({...glossary, [setting]: e.target.checked});
  }

  return (
    <Panel label="Glossary Settings" collapsible={false} minHeight={500} contentClassName={css.glossarySettings}>
      <h2>Glossary Name</h2>
      <EditName name={name} saveName={saveName}/>
      <br />
      <input type="checkbox" checked={askForUserDefinition} onChange={handleUserDefinitionChange()} />
      <label>Require student-provided definitions</label>
      <div className={css.help}>When this option is enabled, students will be required to submit their own
      definition before they can see the authored definition for a term.</div>
      <br />
      <input type="checkbox" className={css.enableStudentRecording} disabled={!enabled} checked={enableStudentRecording} onChange={handleChange("enableStudentRecording")} />
      <label className={`${!enabled && css.disabled}`}>Enable student audio recording for definitions</label>
      <div className={`${css.help} ${css.enableStudentRecording} ${!enabled && css.disabled}`}>When this option is enabled, students have the option
      to record audio definitions in the term popup.</div>
      <br />
      <input type="checkbox" defaultChecked={autoShowMediaInPopup} onChange={handleChange("autoShowMediaInPopup")}/>
      <label>Automatically show media (image or video)</label>
      <div className={css.help}>When this option is enabled, any media associated with a term will be displayed
        to the student automatically in the term popup. If both image and video are provided, students will
        only see the image automatically. If student definitions are required, students will see the video
        after their have provided their own definition. </div>
      <br />
      <input type="checkbox" defaultChecked={showSideBar} onChange={handleChange("showSideBar")}/>
      <label>Show Glossary Sidebar on activity pages</label>
      <div className={css.help}>When this option is enabled, students will have access on every page to a glossary
        of all terms in the activity via a button in the page sidebar.</div>
      <br />
      <input type="checkbox" defaultChecked={enableStudentLanguageSwitching}  onChange={handleChange("enableStudentLanguageSwitching")}/>
      <label>Display language switch for all students</label>
      <div className={css.help}>This requires translations to be provided by the author. When enabled, all students
      have the option to switch between languages in the term popup. NOTE: This will disable the teacher's ability
      to select a secondary language per student in the Glossary Dashboard.</div>
    </Panel>
  )
}