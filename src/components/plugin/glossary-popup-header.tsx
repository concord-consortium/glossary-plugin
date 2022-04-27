import * as React from "react";

import * as css from "./glossary-popup.scss";

export interface ILanguage {
  lang: string;
  selected: boolean;
}

interface IProps {
  languages?: ILanguage[];
  word: string;
  translatedWord: string;
}

export default class GlossaryPopupHeader extends React.Component<IProps, {}> {
  public render() {
    const { languages, word, translatedWord } = this.props;

    if (!languages || (languages.length === 0) ) {
      return (
        <div className={css.header}>
          <h4>Term: {word}</h4>
        </div>
      )
    }

    const en = languages.filter(language => language.lang === "en")[0];

    return (
      <div className={css.header}>
        <h4>Term: {word} {en.selected ? "" : `(${translatedWord})`}</h4>
      </div>
    );
  }
}
