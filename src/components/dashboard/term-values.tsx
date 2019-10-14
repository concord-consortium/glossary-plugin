import * as React from "react";
import ProgressBar from "./progress-bar";
import { Interaction, INTERACTIONS, ITermStats } from "../../utils/usage-stats-helpers";

import * as icons from "../common/icons.scss";
import * as css from "./term-values.scss";

interface IProps {
  width: string;
  anyStudentExpanded: boolean;
  expanded: boolean;
  progress: number;
  expandedInteractions: {[interaction: string]: boolean | undefined};
  showFullValues: boolean;
  stats: ITermStats;
}

const Checkmark = <span className={icons.iconCheckmark + " " + css.green} />;
const Cross = <span className={icons.iconCross + " " + css.red} />;

const Clicked = ({ stats }: { stats: ITermStats, showFull: boolean }) => (
  <div className={css.center}>
    {stats.clicked ? Checkmark :  Cross}
  </div>
);

const Definitions = ({ stats, showFull }: { stats: ITermStats, showFull: boolean }) => (
  <div>
    {
      showFull ?
        (
          <table>
            <tbody>
            {
              stats.definitions.map((d, idx) =>
                <tr key={idx}><td>{idx + 1}.</td><td>{d}</td></tr>)
            }
            </tbody>
          </table>
        )
        :
        (
          stats.definitions.length > 0 &&
          <div className={css.center}>
            <span className={icons.iconFileText} />
          </div>
        )
    }
  </div>
);

const Supports = ({ stats, showFull }: { stats: ITermStats, showFull: boolean }) => {
  let count = 0;
  let total = 1; // text to speech
  if (stats.supports.textToSpeech) {
    count += 1;
  }
  if (stats.supports.imageShown !== undefined) {
    total += 1;
    if (stats.supports.imageShown) {
      count += 1;
    }
  }
  if (stats.supports.videoShown !== undefined) {
    total += 1;
    if (stats.supports.videoShown) {
      count += 1;
    }
  }
  return (
    <div>
      <div className={css.center}>
        {count} / {total}
      </div>
      {
        showFull &&
        <table className={css.uppercase}>
          <tbody>
            <tr>
              <td>{stats.supports.textToSpeech ? Checkmark : Cross}</td>
              <td>Text to speech</td>
            </tr>
            {
              stats.supports.imageShown !== undefined &&
              <tr>
                <td>{stats.supports.imageShown ? Checkmark : Cross}</td>
                <td>Image</td>
              </tr>
            }
            {
              stats.supports.videoShown !== undefined &&
              <tr>
                <td>{stats.supports.videoShown ? Checkmark : Cross}</td>
                <td>Video</td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>
  );
};

const ValueComponent = {
  clicked: Clicked,
  definitions: Definitions,
  supports: Supports
};

export default class TermValues extends React.Component<IProps, {}> {
  public render() {
    const { stats, progress, expanded, showFullValues, width,
      expandedInteractions, anyStudentExpanded } = this.props;
    const interactions = INTERACTIONS.map(i => i.name);
    return (
      <div className={css.termValues} style={{ minWidth: width, width }} data-cy="termValues">
        {
          !expanded && <ProgressBar progress={progress} />}
        {
          expanded && interactions.map((int: Interaction) => {
            const interactionIsExpanded = !!expandedInteractions[int];
            const showFullValue = showFullValues || interactionIsExpanded;
            const showWide = showFullValue || anyStudentExpanded;
            const className = css.value + " " + (showWide ? css.fullValue : "");
            const ValComp = ValueComponent[int];
            return (
              <div key={int} className={className}>
                <ValComp stats={stats} showFull={showFullValue} />
              </div>
            );
          })
        }
      </div>
    );
  }
}
