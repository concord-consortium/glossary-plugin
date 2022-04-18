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
}

const translations: ITranslationMap = {
  es: {
    "Dog.word": "Perro",
    "Dog.definition": "Un mamífero doméstico carnívoro que normalmente tiene un largo snout, una sensación de olfato aguda, clavos no retraibles, y una voz que ronca, ronquiendo, o gritando.",
    "Dog.image_caption": "Un perro llamado Brogan disfruta de un baño en el Parque Nacional Acadia.",
  }
}

type AvailableLanguages = "en" | "es"

export const TermPopUpPreview = ({ settings }: IProps) => {
  const [lang, setLang] = useState<AvailableLanguages>("en")
  const [languages, setLanguages] = useState<ILanguage[]>([])
  const [userDefinitions, setUserDefinitions] = useState<string[]>([]);
  const [settingsUpdateCount, setSettingsUpdateCount] = useState(0)

  const onLanguageChange = useCallback((newLang: AvailableLanguages) => {
    if (settings.enableStudentLanguageSwitching) {
      setLang(newLang);
      setLanguages([
        { lang: "en", selected: newLang === "en" },
        { lang: "es", selected: newLang === "es" }
      ]);
    } else {
      setLang("en");
      setLanguages([]);
    }
  }, [settings])

  const onUserDefinitionsUpdate = (userDefinition: string) => {
    setUserDefinitions([...userDefinitions, userDefinition]);
  }

  useEffect(() => {
    onLanguageChange(lang)
    // increment this on each settings update to force a re-render as this is used as the top level key
    setSettingsUpdateCount(prev => prev + 1);
  }, [settings]);

  const translatePreview = (key: string, fallback: string | null = null, variables: { [key: string]: string } = {}) => {
    return translate(translations, lang, key, fallback, variables);
  }

  // drop log message
  const log = () => undefined

  return (
    <pluginContext.Provider value={{ lang, translate: translatePreview, log }} key={settingsUpdateCount}>
      <div className={css.outerPopup}>
        <div className={css.header}>
          <h4>Term: Dog</h4>
          <h4 className={css.exit}>X</h4>
        </div>
        <div className={css.innerPopup}>
          <GlossaryPopup
            word="Dog"
            definition="A domesticated carniverous mammal that typically has a long snout, an acute sense of smell, nonretractable claws, and a barking, howling, or whining voice."
            imageUrl="https://learn-resources.concord.org/tutorials/images/brogan-acadia.jpg"
            imageCaption="A dog named Brogan enjoying a swim at Acadia National Park."
            languages={languages}
            onLanguageChange={onLanguageChange}
            askForUserDefinition={settings.askForUserDefinition}
            enableStudentRecording={settings.enableStudentRecording}
            autoShowMedia={settings.autoShowMediaInPopup}
            showIDontKnowButton={settings.showIDontKnowButton}
            userDefinitions={settings.askForUserDefinition ? userDefinitions : []}
            onUserDefinitionsUpdate={onUserDefinitionsUpdate}
          />
        </div>
      </div>
    </pluginContext.Provider>
  )
}