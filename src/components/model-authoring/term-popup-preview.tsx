import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import GlossaryPopup from "../plugin/glossary-popup";
import { IGlossarySettings, ITranslationMap, IWordDefinition } from "../../types";
import { ILanguage } from "../plugin/language-selector";
import { pluginContext } from "../../plugin-context";
import { translate } from "../../i18n-context";
import { allLanguages } from "./add-translation";

import * as css from './term-popup-preview.scss';

interface IProps {
  settings: IGlossarySettings;
  translations: ITranslationMap;
  term: IWordDefinition
  lang?: string
  note?: string
  allowReset?: boolean
  resetLabel?: string
  selectedSecondLang?: string
  onSelectSecondLang?: (lang: string) => void
}

export const TermPopUpPreview = (props: IProps) => {
  const {term, settings, translations, note, allowReset, resetLabel, selectedSecondLang, onSelectSecondLang } = props;
  const [lang, setLang] = useState(props.lang || "en")
  const [languages, setLanguages] = useState<ILanguage[]>([])
  const [availableLangs, setAvailableLangs] = useState<string[]>([]);
  const [userDefinitions, setUserDefinitions] = useState<string[]>([]);
  const [renderUpdateCount, setRenderUpdateCount] = useState(0)

  const enableLanguageSwitch = (newLang: string) => {
    if (newLang.length > 0) {
      setLanguages([
        { lang: "en", selected: true },
        { lang: newLang, selected: false }
      ]);
    } else {
      setLanguages([]);
    }
  }

  const onLanguageChange = useCallback((newLang: string) => {
    if (selectedSecondLang) {
      setLang(newLang);
      setLanguages([
        { lang: "en", selected: newLang === "en" },
        { lang: selectedSecondLang, selected: newLang !== "en" }
      ]);
    }
  }, [settings, selectedSecondLang])

  const onUserDefinitionsUpdate = (userDefinition: string) => {
    setUserDefinitions([...userDefinitions, userDefinition]);
  }

  const onReset = () => {
    setUserDefinitions([]);
    onLanguageChange(props.lang || "en");
    forceReRender();
  }

  // increment this on each settings update to force a re-render as this is used as the top level key
  const forceReRender = () => setRenderUpdateCount(prev => prev + 1);

  useEffect(() => {
    onLanguageChange(lang)
    forceReRender()
  }, [settings]);

  useEffect(() => {
    setUserDefinitions([]);
    forceReRender()
  }, [term])

  useEffect(() => {
    forceReRender()
  }, [translations])

  useEffect(() => {
    const langs = Object.keys(translations);
    langs.sort((a, b) => allLanguages[a].localeCompare(allLanguages[b]));
    setAvailableLangs(langs);
  }, [translations])

  const translatePreview = (key: string, fallback: string | null = null, variables: { [key: string]: string } = {}) => {
    return translate(translations, props.lang || lang, key, fallback, variables);
  }

  // drop log message
  const log = () => undefined

  const handleLanguageSelectorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    enableLanguageSwitch(e.target.value);
    onSelectSecondLang?.(e.target.value);
    // reset language to default
    setLang(props.lang || "en");
  }

  const renderLanguageSelector = () => {
    if (onSelectSecondLang && availableLangs.length > 0) {
      return (
        <div className={css.languageSelector}>
          <div>
            Select Second Language
          </div>
          <select value={selectedSecondLang || ""} onChange={handleLanguageSelectorChange}>
            <option value="">No second language</option>
            {availableLangs.map(l => <option value={l} key={l}>{allLanguages[l]}</option>)}
          </select>
        </div>
      )
    }
  }

  return (
    <pluginContext.Provider value={{ lang, translate: translatePreview, log }} key={renderUpdateCount}>
      <div className={css.termPopupPreview}>
        <div className={css.outerPopup}>
          <div className={css.header}>
            <h4>Term: {term.word}</h4>
          </div>
          <div className={css.innerPopup}>
            <GlossaryPopup
              demoMode={true}
              word={term.word}
              definition={term.definition}
              diggingDeeper={term.diggingDeeper}
              imageUrl={term.image}
              imageCaption={term.imageCaption}
              imageAltText={term.imageAltText}
              zoomImageUrl={term.zoomImage}
              videoUrl={term.video}
              videoCaption={term.videoCaption}
              videoAltText={term.videoAltText}
              languages={languages}
              onLanguageChange={onLanguageChange}
              askForUserDefinition={settings.askForUserDefinition}
              enableStudentRecording={settings.enableStudentRecording}
              autoShowMedia={settings.autoShowMediaInPopup}
              disableReadAloud={settings.disableReadAloud}
              showIDontKnowButton={settings.showIDontKnowButton}
              userDefinitions={settings.askForUserDefinition ? userDefinitions : []}
              onUserDefinitionsUpdate={onUserDefinitionsUpdate}
            />
          </div>
        </div>
        {renderLanguageSelector()}
        {note && <div className={css.note}>{note}</div>}
        {allowReset && <button className={css.resetButton} onClick={onReset}>{resetLabel || "Reset"}</button>}
      </div>
    </pluginContext.Provider>
  )
}