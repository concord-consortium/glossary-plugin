// adapted from https://codepen.io/xgad/post/svg-radial-progress-meters

import * as React from "react";

import * as css from "./record-progress.scss";

const OUTER_RADIUS = 14;
const STROKE_WIDTH = 2;
const OUTER_DIAMETER = OUTER_RADIUS * 2;
const INNER_RADIUS = OUTER_RADIUS - (STROKE_WIDTH / 2);
const INNER_CIRCUMFERENCE = 2 * Math.PI * INNER_RADIUS;

interface IProps {
  startTime: number;
  maxDuration: number;
  title: string;
  onClick: () => void;
}

interface IState {
  currentTime: number;
}

export default class RecordProgress extends React.Component<IProps, IState> {
  public state: IState = {
    currentTime: Date.now()
  };

  private tickInterval: number;

  public componentWillMount() {
    this.tickInterval = window.setInterval(() => {
      this.setState({currentTime: Date.now()});
    }, 250);
  }

  public componentWillUnmount() {
    clearInterval(this.tickInterval);
  }

  public render() {
    const { startTime, maxDuration, title, onClick, children } = this.props;
    const { currentTime } = this.state;
    const percentage = Math.min(currentTime - startTime, maxDuration) / maxDuration;
    const offset = INNER_CIRCUMFERENCE * (1 - percentage);
    return (
      <div className={css.recordProgress} onClick={onClick} title={title}>
        <svg width={OUTER_DIAMETER} height={OUTER_DIAMETER} viewBox={`0 0 ${OUTER_DIAMETER} ${OUTER_DIAMETER}`}>
          <circle
            cx={OUTER_RADIUS}
            cy={OUTER_RADIUS}
            r={INNER_RADIUS}
            fill="none"
            stroke="#00e202"
            strokeWidth={STROKE_WIDTH}
            strokeDasharray={INNER_CIRCUMFERENCE}
            strokeDashoffset={offset}
          />
        </svg>
        {children}
      </div>
    );
  }
}
