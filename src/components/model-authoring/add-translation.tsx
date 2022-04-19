import * as React from "react";
import { useEffect, useRef, useState } from "react";

import { IGlossary, ITranslationMap } from "../../types";
import { POEDITOR_LANG_CODE } from "../../utils/poeditor-language-list";

import * as css from "./add-translation.scss";

interface IProps {
  glossary: IGlossary;
  saveTranslations: (translations: ITranslationMap) => void
}

export const allLanguages = {
  [POEDITOR_LANG_CODE.Arabic]: "Arabic",
  [POEDITOR_LANG_CODE.Maori]: "Athabaskan", // using Maori as there is no native code for Athabaskan
  [POEDITOR_LANG_CODE.Chinese]: "Chinese",
  [POEDITOR_LANG_CODE.Marshallese]: "Hawaiian", // using Marshallese as there is no native code for Hawaiian
  [POEDITOR_LANG_CODE.Marathi]: "Inupiaq", // using Marathi as there is no native code for Inupiaq
  [POEDITOR_LANG_CODE.Portuguese]: "Portuguese",
  [POEDITOR_LANG_CODE.Russian]: "Russian",
  [POEDITOR_LANG_CODE.Spanish]: "Spanish",
  [POEDITOR_LANG_CODE.Manx]: "Yugtun", // using Manx as there is no native code for Yugtun
}

export const AddTranslation = ({ glossary, saveTranslations }: IProps) => {
  const selectRef = useRef<HTMLSelectElement|null>(null);
  const [unusedLanguages, setUnusedLanguages] = useState(allLanguages);

  const handleAddLanguage = () => {
    if (selectRef.current) {
      const newLang = selectRef.current.value;
      const translations = glossary.translations || {}
      if (!translations[newLang]) {
        translations[newLang] = {};
        saveTranslations(translations)
      }
    }
  }

  useEffect(() => {
    const languages = {...allLanguages}
    Object.keys(glossary.translations || {}).forEach(lang => {
      delete languages[lang];
    })
    setUnusedLanguages(languages)
  }, [glossary]);

  if (Object.keys(unusedLanguages).length === 0) {
    return null;
  }

  return (
    <div className={css.addTranslation}>
      <div><strong>Additional Languages</strong></div>
      <select ref={selectRef}>
        {Object.keys(unusedLanguages).map(lang => {
          const name = unusedLanguages[lang as keyof typeof unusedLanguages];
          return <option key={lang} value={lang}>{name}</option>
        })}
      </select>
      <button onClick={handleAddLanguage}>Add Language</button>
    </div>
 )
}