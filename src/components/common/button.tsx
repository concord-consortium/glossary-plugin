import * as React from "react";
import * as css from "./button.scss";
import * as icons from "./icons.scss";

interface IProps {
  onClick: (e: React.MouseEvent) => void;
  label?: string;
  icon?: string;
  disabled?: boolean;
  className?: string;
}

export default class Button extends React.Component<IProps, {}> {
  public render() {
    const { icon, label, children, disabled, className } = this.props;
    return (
      <span
        className={css.button + " " + (disabled ? css.disabled : "") + (className ? className : "")}
        onClick={this.handleClick}
      >
        {icon && <span className={css.icon + " " + icons[icon]}/>}
        <span className={css.label}>{label || children}</span>
      </span>
    );
  }

  private handleClick = (e: React.MouseEvent) => {
    if (this.props.disabled) {
      return;
    }
    this.props.onClick(e);
  };
}
