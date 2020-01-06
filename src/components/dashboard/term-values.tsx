import * as React from "react";
import ProgressBar from "./progress-bar";
import { Interaction, INTERACTIONS, ITermStats } from "../../utils/usage-stats-helpers";
import { isAudioOrRecordingUrl, getAudio } from "../../utils/audio";

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

interface ICurrentAudio {
  element: HTMLAudioElement;
  definition: string;
}

let currentAudio: ICurrentAudio | null = null;

// tslint:disable-next-line:max-line-length
const Definition = ({ definitions, definition }: {definitions: string[], definition: string}) => {
  const playRecording = () => {
    if (currentAudio) {
      const {element} = currentAudio;

      // toggle current audio
      if (currentAudio.definition === definition) {
        if (element.paused) {
          element.currentTime = 0;
          element.play();
        } else {
          element.pause();
        }
        return;
      }

      // pause existing recording before playing new one
      element.pause();
    }

    getAudio(definition)
      .then(audio => {
        currentAudio = {
          element: audio,
          definition
        };
        currentAudio.element.play();
      })
      .catch(err => alert(err.toString()));
  };

  if (isAudioOrRecordingUrl(definition)) {
    const recordingIndex = definitions.filter(isAudioOrRecordingUrl).indexOf(definition) + 1;
    return (
      <>
        {`Audio definition ${recordingIndex}`}
        <span
          className={icons.iconButton + " " + icons.iconAudio}
          onClick={playRecording}
          title="Play Recording"
        />
      </>
    );
  }
  return <>{definition}</>;
};

const Definitions = ({ stats, showFull }: { stats: ITermStats, showFull: boolean }) => {
  const numAudioUrls = stats.definitions.filter(isAudioOrRecordingUrl).length;
  const hasAudio = numAudioUrls > 0;
  const hasText = stats.definitions.length > numAudioUrls;

  return (
    <div>
      {
        showFull ?
          (
            <table>
              <tbody>
              {
                stats.definitions.map((definition, idx) =>
                  <tr key={idx}>
                    <td>{idx + 1}.</td>
                    <td>
                      <Definition definitions={stats.definitions} definition={definition} />
                    </td>
                  </tr>)
              }
              </tbody>
            </table>
          )
          :
          (
            (hasText || hasAudio) &&
            <div className={css.center}>
              {hasText ? <span className={icons.iconFileText} /> : undefined}
              {hasAudio ? <span className={icons.iconAudio} style={{marginLeft: hasText ? 5 : 0}} /> : undefined}
            </div>
          )
      }
    </div>
  );
};

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
