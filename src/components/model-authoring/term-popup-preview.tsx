import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import GlossaryPopup from "../plugin/glossary-popup";
import { IGlossarySettings, ITranslationMap, IWordDefinition } from "../../types";
import { ILanguage } from "../plugin/language-selector";
import { pluginContext } from "../../plugin-context";
import { translate } from "../../i18n-context";

import * as css from './term-popup-preview.scss';

interface IProps {
  settings: IGlossarySettings;
  translations: ITranslationMap;
  term: IWordDefinition
  lang?: string
}

export const TermPopUpPreview = (props: IProps) => {
  const { term, settings, translations } = props;
  const [lang, setLang] = useState(props.lang || "en")
  const [languages, setLanguages] = useState<ILanguage[]>([])
  const [userDefinitions, setUserDefinitions] = useState<string[]>([]);
  const [renderUpdateCount, setRenderUpdateCount] = useState(0)

  const onLanguageChange = useCallback((newLang: string) => {
    if (settings.enableStudentLanguageSwitching) {
      setLang(newLang);
      setLanguages([
        { lang: "en", selected: newLang === "en" },
        { lang: "es", selected: newLang === "es" }
      ]);
    } else {
      setLang(props.lang || "en");
      setLanguages([]);
    }
  }, [settings])

  const onUserDefinitionsUpdate = (userDefinition: string) => {
    setUserDefinitions([...userDefinitions, userDefinition]);
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

  const translatePreview = (key: string, fallback: string | null = null, variables: { [key: string]: string } = {}) => {
    return translate(translations, props.lang || lang, key, fallback, variables);
  }

  // drop log message
  const log = () => undefined

  return (
    <pluginContext.Provider value={{ lang, translate: translatePreview, log }} key={renderUpdateCount}>
      <div className={css.outerPopup}>
        <div className={css.header}>
          <h4>Term: {term.word}</h4>
          <h4 className={css.exit}>X</h4>
        </div>
        <div className={css.innerPopup}>
          <GlossaryPopup
            word={term.word}
            definition={term.definition}
            imageUrl={term.image}
            imageCaption={term.imageCaption}
            zoomImageUrl={term.zoomImage}
            videoUrl={term.video}
            videoCaption={term.videoCaption}
            languages={languages}
            onLanguageChange={onLanguageChange}
            askForUserDefinition={settings.askForUserDefinition}
            enableStudentRecording={settings.enableStudentRecording}
            autoShowMedia={settings.autoShowMediaInPopup}
            userDefinitions={settings.askForUserDefinition ? userDefinitions : []}
            onUserDefinitionsUpdate={onUserDefinitionsUpdate}
          />
        </div>
      </div>
    </pluginContext.Provider>
  )
}