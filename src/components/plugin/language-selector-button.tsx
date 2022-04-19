import * as React from "react";
import Button from "../common/button";
import { POEDITOR_LANG_NAME } from "../../utils/poeditor-language-list";
import { ILanguage } from "./language-selector";

import * as css from "./language-selector-button.scss";

interface IProps {
  language: ILanguage;
  onClick: (lang: string) => void;
}

export default class LanguageSelectorButton extends React.Component<IProps, {}> {

  constructor(props: IProps) {
    super(props);
    this.handleButtonClick = this.handleButtonClick.bind(this);
  }

  public render() {
    const { lang, selected } = this.props.language;
    return (
      <Button
        data-cy="langToggle"
        className={`${css.langButton} ${lang === "en" ? css.en : css.secondLang } ${selected ? css.selected : ""}`}
        label={POEDITOR_LANG_NAME[lang].replace("_", " ")}
        onClick={this.handleButtonClick}
      />
    );
  }

  private handleButtonClick = () => {
    this.props.onClick(this.props.language.lang);
  }
}
