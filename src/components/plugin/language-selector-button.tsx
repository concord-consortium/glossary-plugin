import * as React from "react";
import Button from "../common/button";
import { POEDITOR_LANG_NAME } from "../../utils/poeditor-language-list";

import * as css from "./language-selector-button.scss";

interface IProps {
  lang: string;
  onClick: (lang: string) => void;
}

export default class LanguageSelectorButton extends React.Component<IProps, {}> {

  constructor(props: IProps) {
    super(props);
    this.handleButtonClick = this.handleButtonClick.bind(this);
  }

  public render() {
    const { lang } = this.props;
    return (
      <Button
        data-cy="langToggle"
        className={css.langButton}
        label={POEDITOR_LANG_NAME[lang].replace("_", " ")}
        onClick={this.handleButtonClick}
      />
    );
  }

  private handleButtonClick = () => {
    this.props.onClick(this.props.lang);
  }
}
