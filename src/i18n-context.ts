import * as React from "react";
import { ITranslation, IGlossary } from "./types";
import * as enLang from "./lang/en.json";
import * as esLang from "./lang/es.json";
import * as ptLang from "./lang/pt.json";
import * as arLang from "./lang/ar.json";
import * as ruLang from "./lang/ru.json";
import * as gvLang from "./lang/gv.json";
import * as miLang from "./lang/mi.json";
import * as mrLang from "./lang/mr.json";
import * as zhCNLang from "./lang/zh-CN.json";

type ITranslateFunc = (key: string, fallback?: string | null, variables?: {[key: string]: string}) => string | null;

export const UI_TRANSLATIONS: {
  [languageCode: string]: ITranslation
} = {
  "en": enLang,
  "es": esLang,
  "pt": ptLang,
  "ar": arLang,
  "ru": ruLang,
  "zh-CN": zhCNLang,
  "gv": gvLang,
  "mi": miLang,
  "mr": mrLang,
};

export const SUPPORTED_LANGUAGES = Object.keys(UI_TRANSLATIONS);

export const DEFAULT_LANG = "en";

export const replaceVariables = (input: string, variables: {[key: string]: string} = {}) => {
  // Variables look like %{testVariableName}.
  const variableRegExp = /%\{\s*([^}\s]*)\s*\}/g;
  return input.replace(variableRegExp, (match, variableKey) =>
    variables[variableKey] || `* UNKNOWN KEY: ${variableKey} *`
  );
};

export const defaultTranslate: ITranslateFunc = (key, fallback = null, variables = {}) => {
  const result = UI_TRANSLATIONS[DEFAULT_LANG][key] || fallback;
  if (!result) {
    return result;
  }
  return replaceVariables(result, variables);
};

// Check glossary at glossaryUrl for `translations` keys. If those exist
// return them. Otherwise return `SUPPORTED_LANGUAGES` constant.
export const fetchGlossaryLanguages = (
  glossaryUrl: string | null,
  callback: (languageCodes: string[]) => void) => {

  const setLangs = (glossary: IGlossary) => {
    const {translations} = glossary;
    if (translations && Object.keys(translations).length > 0) {
      callback(Object.keys(translations));
    }
  };

  if (glossaryUrl) {
    fetch(glossaryUrl)
    .then( (response: Response) => {
      response.json().then(setLangs);
    });
  } else {
    callback(SUPPORTED_LANGUAGES);
  }
};

export const pluginContext = React.createContext({ lang: DEFAULT_LANG, translate: defaultTranslate });
