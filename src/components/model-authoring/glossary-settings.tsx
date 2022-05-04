import * as React from "react";
import { useState } from "react";

import { IGlossary, IGlossarySettings, ITranslationMap, IWordDefinition } from "../../types";
import { Panel } from "./panel";
import { EditName } from "./edit-name";
import { TermPopUpPreview } from "./term-popup-preview";

import * as css from "./glossary-settings.scss";

interface IProps {
  name: string;
  glossary: IGlossary;
  canEdit: boolean;
  saveSettings: (settings: IGlossarySettings) => void;
  saveName: (name: string) => void;
}

export const previewTerm: IWordDefinition = {
  word: "Dog",
  definition: "A domesticated carnivorous mammal that typically has a long snout, an acute sense of smell, nonretractable claws, and a barking, howling, or whining voice.",
  diggingDeeper: "noun: dog; plural noun: dogs",
  image: "https://learn-resources.concord.org/tutorials/images/brogan-acadia.jpg",
  imageCaption: "A dog named Brogan enjoying a swim at Acadia National Park.",
  imageAltText: "A photograph of a golden retriever standing on a rocky shore with water behind him and a forest in the distance."
}

const previewTranslations: ITranslationMap = {
  es: {
    "Dog.word": "Perro",
    "Dog.definition": "Un mamífero doméstico carnívoro que normalmente tiene un largo snout, una sensación de olfato aguda, clavos no retraibles, y una voz que ronca, ronquiendo, o gritando.",
    "Dog.digging_deeper": "sustantivo: perro; sustantivo plural: perros",
    "Dog.image_caption": "Un perro llamado Brogan disfruta de un baño en el Parque Nacional Acadia.",
    "Dog.image_alt_text": "Una fotografía de un golden retriever parado en una orilla rocosa con agua detrás de él y un bosque en la distancia."
  }
}

export const GlossarySettings = ({ name, glossary, canEdit, saveSettings, saveName }: IProps) => {
  const { askForUserDefinition, showSideBar, autoShowMediaInPopup, showIDontKnowButton, enableStudentRecording, disableReadAloud } = glossary;
  const [enabled, setEnabled] = useState<boolean>(askForUserDefinition);
  const [selectedSecondLang, setSelectedSecondLang] = useState("")

  const handleUserDefinitionChange = () => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (canEdit) {
      setEnabled(e.target.checked);
      if (!e.target.checked){
        saveSettings({...glossary, "askForUserDefinition": false, "enableStudentRecording": false, "showIDontKnowButton": false})
      } else {
        saveSettings({...glossary, "askForUserDefinition": e.target.checked})
      }
    }
  }

  const handleChange = (setting: keyof IGlossarySettings ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    saveSettings({...glossary, [setting]: e.target.checked});
  }

  return (
    <Panel label="Glossary Settings" collapsible={false}>
      <div className={css.glossarySettings}>
        <div>
          <h2>Glossary Name</h2>
          <EditName name={name} saveName={saveName} canEdit={canEdit}/>
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
            <input type="checkbox" checked={disableReadAloud} onChange={handleChange("disableReadAloud")}/>
            <label>
              Disable read-aloud buttons
            </label>
          </div>
          <div className={css.help}>
            When this option is enabled, the read-aloud buttons will not be shown on the term popup
            or in the Glossary Sidebar.
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
            This preview shows an example term popup to demonstrate these settings.
            To preview the terms in this glossary, use the preview button in the
            Glossary Terms & Definitions panel.
          </div>
        </div>

        <TermPopUpPreview
          term={previewTerm}
          settings={glossary}
          translations={previewTranslations}
          allowReset={true}
          resetLabel="Reset Term Popup Preview"
          selectedSecondLang={selectedSecondLang}
          onSelectSecondLang={setSelectedSecondLang}
        />
      </div>
    </Panel>
  )
}