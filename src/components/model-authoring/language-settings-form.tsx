import * as React from "react";
import { useEffect, useState } from "react";
import { IGlossary, IGlossarySettings } from "../../types";
import { TermPopUpPreview } from "./term-popup-preview";
import { allLanguages } from "./add-translation";
import { translate } from "../../i18n-context";
import { previewTerm } from "./glossary-settings";
import UploadableInput from "./uploadable-input";

import * as css from "./shared-modal-form.scss";

export interface ILanguageSettings {
  main_prompt_mp3_url: string;
  write_definition_mp3_url: string;
}

type ILanguageSettingsFields = "mainPromptMP3Url" | "writeDefinitionMP3Url";

type IProps = {
  lang: string
  glossary: IGlossary
  usedLangs: string[]
  canEdit: boolean;
  onEdit: (settingsLang: string, languageSettings: ILanguageSettings) => void
  onCancel: () => void;
}

export const LanguageSettingsForm = (props: IProps) => {
  const {canEdit} = props;
  const translations = props.glossary.translations || {}
  const formRef = React.useRef<HTMLFormElement>(null);
  const [lang, setLang] = useState(props.lang);
  const [previewSettings, setPreviewSettings] = useState<ILanguageSettings>()

  const getNewSettings = () => {
    const newSettings: ILanguageSettings = {
      main_prompt_mp3_url: getFormValue("mainPromptMP3Url"),
      write_definition_mp3_url: getFormValue("writeDefinitionMP3Url"),
    }
    return newSettings
  }

  const getTranslatedValue = (field: ILanguageSettingsFields) => {
    switch (field) {
      case "mainPromptMP3Url":
        return translate(translations, lang, "main_prompt_mp3_url", "");
      case "writeDefinitionMP3Url":
        return translate(translations, lang, "write_definition_mp3_url", "");
    }
  }

  const getFormValue = (field: ILanguageSettingsFields) => {
    return ((formRef.current?.elements.namedItem(field) as HTMLInputElement|HTMLTextAreaElement)?.value || "").trim()
  }

  const handleCancel = (e: React.FormEvent<HTMLFormElement>|React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    props.onCancel()
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>|React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    props.onEdit(lang, getNewSettings())
  }

  const handleChangeLang = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLang(e.target.value)
  }

  const renderPreview = () => {
    const settings: IGlossarySettings = {...props.glossary, askForUserDefinition: true, enableStudentLanguageSwitching: false}
    const previewTranslations = {
      [lang]: {...translations[lang], ...previewSettings }
    }
    return <TermPopUpPreview key={lang} term={previewTerm} settings={settings} translations={previewTranslations} lang={lang}/>
  }

  const handleFormChange = () => {
    if (canEdit) {
      setPreviewSettings(getNewSettings())
    }
  };

  useEffect(() => {
    setPreviewSettings(getNewSettings())
  }, [formRef.current, lang])

  return (
    <div className={css.modalForm} key={lang}>
      <div className={css.left}>
        <div className={css.header}>
          <div>
            {canEdit ? "Edit" : "View"} {allLanguages[lang]} Settings
          </div>
          <div>
            <a href="https://docs.google.com/document/d/1HA8KaOHR3pd027UJKq96DK2TKUDA2-sYDIemZ94kN9g/edit?usp=sharing" target="_blank" rel="noopener noreferrer" title="Open Glossary Authoring Guide in a new tab">Help</a>
            <span onClick={props.onCancel} title="Close without saving"><strong>X</strong></span>
          </div>
        </div>
        <form onSubmit={handleSubmit} onChange={handleFormChange} ref={formRef}>
          <div className={css.fieldset}>
            <legend>Language</legend>
            <div>
              <select value={lang} onChange={handleChangeLang}>
                {props.usedLangs.map(usedLang => <option key={usedLang} value={usedLang}>{allLanguages[usedLang]}</option>)}
              </select>
            </div>
          </div>
          <div className={css.fieldset}>
            <legend>Main Prompt MP3 URL</legend>
            <div>
              <UploadableInput type="audio" name="mainPromptMP3Url" defaultValue={getTranslatedValue("mainPromptMP3Url")} placeholder={`MP3 recording of translated main prompt instructions`} />
            </div>
          </div>
          <div className={css.fieldset}>
            <legend>Write Definition MP3 URL</legend>
            <div>
              <UploadableInput type="audio" name="writeDefinitionMP3Url" defaultValue={getTranslatedValue("writeDefinitionMP3Url")} placeholder={`MP3 recording of translated write definition instructions`} />
            </div>
          </div>
        </form>

        <div className={css.buttons}>
          {canEdit && <button type="submit" onClick={handleSubmit}>Save &amp; Close</button>}
          {!canEdit && <button type="submit" onClick={handleCancel}>Close</button>}
        </div>
      </div>
      <div className={css.right}>
        {renderPreview()}
      </div>
    </div>
  );
};
