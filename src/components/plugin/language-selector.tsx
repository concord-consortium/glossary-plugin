import * as React from "react";
import LanguageSelectorButton from "./language-selector-button";

import * as css from "./language-selector.scss";

export interface ILanguage {
  lang: string;
  selected: boolean;
}

interface IProps {
  languages?: ILanguage[];
  onLanguageChange?: (lang: string) => void;
}

export default class LanguageSelector extends React.Component<IProps, {}> {

  public render() {
    const { languages, onLanguageChange } = this.props;

    if (!languages || (languages.length === 0) || !onLanguageChange) {
      return null;
    }

    return (
      <div className={css.languageSelector}>
        {languages.map((language, idx) => (
          <LanguageSelectorButton
            key={language.lang}
            language={language}
            onClick={onLanguageChange}
            index={idx}
          />))}
      </div>
    );
  }

}
