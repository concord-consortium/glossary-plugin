import * as React from "react";
import { useCallback, useEffect, useState } from "react";
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
  const [lang, setLang] = useState(props.lang);
  const [mainPromptMP3Url, setMainPromptMP3Url] = useState("")
  const [writeDefinitionMP3Url, setWriteDefinitionMP3Url] = useState("")

  useEffect(() => {
    setMainPromptMP3Url(translate(translations, lang, "main_prompt_mp3_url", ""))
    setWriteDefinitionMP3Url(translate(translations, lang, "write_definition_mp3_url", ""))
  }, [translations, lang])

  const handleCancel = (e: React.FormEvent<HTMLFormElement>|React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    props.onCancel()
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>|React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    props.onEdit(lang, {
      main_prompt_mp3_url: mainPromptMP3Url,
      write_definition_mp3_url: writeDefinitionMP3Url,
    })
  }

  const handleChangeMainPromptMP3Url = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMainPromptMP3Url(e.target.value);
  }

  const handleChangeWriteDefinitionMP3Url = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWriteDefinitionMP3Url(e.target.value);
  }

  const handleChangeLang = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLang(e.target.value)
  }

  const renderPreview = () => {
    const settings: IGlossarySettings = {...props.glossary, askForUserDefinition: true, enableStudentLanguageSwitching: false}
    const previewSettings: ILanguageSettings = {
      main_prompt_mp3_url: mainPromptMP3Url,
      write_definition_mp3_url: writeDefinitionMP3Url
    }
    const previewTranslations = {
      [lang]: {...translations[lang], ...previewSettings }
    }
    return <TermPopUpPreview key={lang} term={previewTerm} settings={settings} translations={previewTranslations} lang={lang}/>
  }

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
        <form onSubmit={handleSubmit}>
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
              <UploadableInput
                type="audio"
                name="mainPromptMP3Url"
                value={mainPromptMP3Url}
                placeholder={`MP3 recording of translated main prompt instructions`}
                onChange={handleChangeMainPromptMP3Url}
              />
            </div>
          </div>
          <div className={css.fieldset}>
            <legend>Write Definition MP3 URL</legend>
            <div>
              <UploadableInput
                type="audio"
                name="writeDefinitionMP3Url"
                value={writeDefinitionMP3Url}
                placeholder={`MP3 recording of translated write definition instructions`}
                onChange={handleChangeWriteDefinitionMP3Url}
              />
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
