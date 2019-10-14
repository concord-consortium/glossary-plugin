import * as React from "react";
import * as css from "./progress-bar.scss";

interface IProps {
  progress: number;
}

export default class ProgressBar extends React.Component<IProps, {}> {
  public render() {
    const { progress } = this.props;
    return (
      <div className={css.progressBarCell}>
        <div className={css.progressBar}>
          <div className={`${css.bar} ${progress === 1 ? css.completed : ""}`} style={{width: `${progress * 100}%`}} />
        </div>
      </div>
    );
  }
}
