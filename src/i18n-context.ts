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

export interface IFetchGlossaryCallbackOptions {
  languageCodes: string[];
  enableRecording: boolean;
}

// Check glossary at glossaryUrl for `translations` keys and recording enabled.
// If translation keys exist return them. otherwise return `SUPPORTED_LANGUAGES` constant.
export const fetchGlossary = (
  glossaryUrl: string | null,
  callback: (options: IFetchGlossaryCallbackOptions) => void) => {

  const setLangs = (glossary: IGlossary) => {
    const {translations} = glossary;
    const languageCodes = translations && Object.keys(translations).length > 0
      ? Object.keys(translations)
      : SUPPORTED_LANGUAGES;
    callback({
      languageCodes,
      enableRecording: !!glossary.enableStudentRecording
    });
  };

  if (glossaryUrl) {
    fetch(glossaryUrl)
    .then( (response: Response) => {
      response.json().then(setLangs);
    })
    .catch((e) => {
      // tslint:disable-next-line:no-console
      console.warn(e);
    });
  } else {
    callback({languageCodes: SUPPORTED_LANGUAGES, enableRecording: false});
  }
};

export const pluginContext = React.createContext({ lang: DEFAULT_LANG, translate: defaultTranslate });
