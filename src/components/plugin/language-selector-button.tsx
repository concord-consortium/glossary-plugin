import * as React from "react";
import Button from "../common/button";
import { POEDITOR_LANG_NAME } from "../../utils/poeditor-language-list";
import { ILanguage } from "./language-selector";

import * as css from "./language-selector-button.scss";

interface IProps {
  language: ILanguage;
  onClick: (lang: string) => void;
  index: number;
}

export default class LanguageSelectorButton extends React.Component<IProps, {}> {

  constructor(props: IProps) {
    super(props);
    this.handleButtonClick = this.handleButtonClick.bind(this);
  }

  public render() {
    const { index } = this.props;
    const { lang, selected } = this.props.language;
    return (
      <Button
        data-testid={`language-selector-button-${lang}`}
        data-cy="langToggle"
        className={`${css.langButton} ${index === 0 ? css.firstLang : css.secondLang } ${selected ? css.selected : ""}`}
        label={POEDITOR_LANG_NAME[lang].replace("_", " ")}
        onClick={this.handleButtonClick}
      />
    );
  }

  private handleButtonClick = () => {
    this.props.onClick(this.props.language.lang);
  }
}
