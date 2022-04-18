import * as React from "react";
import { useState } from "react";

import { IGlossary, IGlossarySettings } from "../../types";
import { Panel } from "./panel";
import { EditName } from "./edit-name";
import { TermPopUpPreview } from "./term-popup-preview";

import * as css from "./glossary-settings.scss";

interface IProps {
  name: string;
  glossary: IGlossary;
  saveSettings: (settings: IGlossarySettings) => void;
  saveName: (name: string) => void;
}

export const GlossarySettings = ({ name, glossary, saveSettings, saveName }: IProps) => {
  const { askForUserDefinition, showSideBar, autoShowMediaInPopup, showIDontKnowButton, enableStudentRecording, enableStudentLanguageSwitching } = glossary;
  const [enabled, setEnabled] = useState<boolean>(askForUserDefinition);

  const handleUserDefinitionChange = () => (e: React.ChangeEvent<HTMLInputElement>) => {
    setEnabled(e.target.checked);
    if (!e.target.checked){
      saveSettings({...glossary, "askForUserDefinition": false, "enableStudentRecording": false, "showIDontKnowButton": false})
    } else {
      saveSettings({...glossary, "askForUserDefinition": e.target.checked})
    }
  }

  const handleChange = (setting: keyof IGlossarySettings ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    saveSettings({...glossary, [setting]: e.target.checked});
  }

  return (
    <Panel label="Glossary Settings" collapsible={false} minHeight={500} contentClassName={css.glossarySettings}>
      <div>
        <h2>Glossary Name</h2>
        <EditName name={name} saveName={saveName}/>
      </div>
      <div className={css.settingInformation}>
        <div className={css.checkboxRow}>
          <input type="checkbox" checked={askForUserDefinition} onChange={handleUserDefinitionChange()} />
          <label>
            Require student-provided definitions
          </label>
        </div>
        <div className={css.help}>
          When this option is enabled, students will be required to submit their own definition
          before they can see the authored definition for a term.
        </div>
      </div>

      <div className={`${css.settingInformation} ${css.nestedOptions}`}>
        <div className={css.checkboxRow}>
          <input type="checkbox" disabled={!enabled} checked={showIDontKnowButton} onChange={handleChange("showIDontKnowButton")} />
          <label className={`${!enabled && css.disabled}`}>
            Display "I Don't Know" button
          </label>
        </div>
        <div className={`${css.help} ${!enabled && css.disabled}`}>
          When this option is enabled, students can click "I don't know" instead of providing their own definition. Their first
          definition will be recorded as "I don't know". The student will see the authored definition after clicking this button.
        </div>
      </div>

      <div className={`${css.settingInformation} ${css.nestedOptions}`}>
        <div className={css.checkboxRow}>
          <input type="checkbox" disabled={!enabled} checked={enableStudentRecording} onChange={handleChange("enableStudentRecording")} />
          <label className={`${!enabled && css.disabled}`}>
            Enable student audio recording for definitions
          </label>
        </div>
        <div className={`${css.help} ${!enabled && css.disabled}`}>
          When this option is enabled, students have the option to record audio definitions in the term popup.
        </div>
      </div>

      <div className={css.settingInformation}>
        <div className={css.checkboxRow}>
          <input type="checkbox" checked={autoShowMediaInPopup} onChange={handleChange("autoShowMediaInPopup")}/>
          <label>
            Automatically show media (image or video)
          </label>
        </div>
        <div className={css.help}>
          When this option is enabled, any media associated with a term will be displayed
          to the student automatically in the term popup. If both image and video are provided,
          students will only see the image automatically. If student definitions are required,
          students will see the video after their have provided their own definition.
        </div>
      </div>

      <div className={css.settingInformation}>
        <div className={css.checkboxRow}>
          <input type="checkbox" checked={enableStudentLanguageSwitching}  onChange={handleChange("enableStudentLanguageSwitching")}/>
          <label>
            Display language switch for all students
          </label>
        </div>
        <div className={css.help}>
          This requires translations to be provided by the author. When enabled, all students
          have the option to switch between languages in the term popup. NOTE: This will disable
          the teacher's ability to select a secondary language per student in the Glossary Dashboard.
        </div>
      </div>

      <div className={css.settingInformation}>
        <div className={css.checkboxRow}>
          <input type="checkbox" checked={showSideBar} onChange={handleChange("showSideBar")}/>
          <label>
            Show Glossary Sidebar on activity pages
          </label>
        </div>
        <div className={css.help}>
          When this option is enabled, students will have access on every page to a glossary
          of all terms in the activity via a button in the page sidebar.
        </div>
      </div>

      <div className={css.settingInformation}>
        <h2 className={css.termPopup}>Term Popup Preview</h2>
        <div className={css.help}>
          This popup shows an example term popup to demonstrate these settings.
          To preview the terms in this glossary, use the preview button in the
          Glossary Terms & Definitions panel.
        </div>
      </div>

      <TermPopUpPreview settings={glossary}/>
    </Panel>
  )
}