import * as React from "react";
import LanguageSelectorButton from "./language-selector-button";

import * as css from "./language-selector.scss";

interface IProps {
  otherLanguages?: string[];
  onLanguageChange?: (lang: string) => void;
}

export default class LanguageSelector extends React.Component<IProps, {}> {

  public render() {
    const { otherLanguages, onLanguageChange } = this.props;

    if (!otherLanguages || (otherLanguages.length === 0) || !onLanguageChange) {
      return null;
    }

    return (
      <div className={css.languageSelector}>
        {otherLanguages.map(lang => <LanguageSelectorButton key={lang} lang={lang} onClick={onLanguageChange} />)}
      </div>
    );
  }

}
