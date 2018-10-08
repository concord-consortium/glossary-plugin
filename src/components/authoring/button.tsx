import * as React from "react";
import * as css from "./button.scss";
import * as icons from "../icons.scss";

interface IProps {
  onClick: () => void;
  label?: string;
  icon?: string;
}

export default class Button extends React.Component<IProps, {}> {
  public render() {
    const { icon, label, children } = this.props;
    return (
      <span className={css.button} onClick={this.props.onClick}>
        {icon && <span className={css.icon + " " + icons[icon]}/>}
        <span className={css.label}>{label || children}</span>
      </span>
    );
  }
}
