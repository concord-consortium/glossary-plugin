import * as React from "react";
import * as css from "./button.scss";

interface IProps {
  className?: string;
  disabled?: boolean;
  onClick: (event: Event) => void;
}

export default class Button extends React.Component<IProps, {}> {
  get className() {
    const { className, disabled } = this.props;
    return `${css.ccButton} ${className} ${disabled ? css.disabled : ""}`;
  }

  public render() {
    const { children } = this.props;
    return <a className={this.className} onClick={this.handleClick}>{children}</a>;
  }

  private handleClick = (event: any) => {
    const { onClick, disabled } = this.props;
    if (disabled) {
      return;
    }
    onClick(event);
  }
}
