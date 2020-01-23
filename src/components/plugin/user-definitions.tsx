import * as React from "react";
import { pluginContext } from "../../plugin-context";
import * as css from "./user-definitions.scss";
import * as icons from "../common/icons.scss";
import { getAudio, isAudioOrRecordingUrl } from "../../utils/audio";

interface IProps {
  userDefinitions: string[];
}

interface IState {
  allUserDefsVisible: boolean;
}

interface ICurrentAudio {
  element: HTMLAudioElement;
  userDefinition: string;
}

const getOrdinal = (n: number, max: number) => {
  if (n === 0 || n === 1) {
    return ""; // current or previous
  }
  return max - n;
};

export default class UserDefinitions extends React.Component<IProps, IState> {
  public static contextType = pluginContext;

  public state: IState = {
    allUserDefsVisible: false
  };

  private currentAudio: ICurrentAudio | null = null;

  public render() {
    const { userDefinitions, } = this.props;
    const { allUserDefsVisible } = this.state;
    if (userDefinitions.length === 0) {
      return null;
    }
    const caretIconClass = icons.iconButton + " " + (allUserDefsVisible ? icons.iconCaretExpanded : icons.iconCaret);
    return (
      <div className={css.userDefinitions}>
        {this.renderUserDef(0)}
        {
          userDefinitions.length > 1 &&
          <span className={caretIconClass} onClick={this.toggleAllUserDefinitions}/>
        }
        <div className={css.remainingUserDefs + " " + (allUserDefsVisible ? css.expanded : "")}>
          {allUserDefsVisible &&
            // .slice(1).map is just a way to iterate over userDefinitions.length - 2 numbers, as the first one
            // is already rendered above. Note that we ignore values.
            userDefinitions.slice(1).map((_, index) => this.renderUserDef(index + 1))
          }
        </div>
      </div>
    );
  }

  // Note that index = 0 means the most recent definition (current one).
  private renderUserDef(index: number) {
    const { userDefinitions } = this.props;
    const i18n = this.context;
    if (!userDefinitions) {
      return;
    }
    const ordinal = getOrdinal(index, userDefinitions.length);
    const label = index === 1 ? i18n.translate("myPrevDefinition") : i18n.translate("myDefinition");
    return (
      <span className={css.userDefinition} key={index}>
        <div className={css.userDefinitionHeader}>
          {label}{ordinal ? ` #${ordinal}` : ""}:
        </div>
        {this.renderUserDefText(index)}
      </span>
    );
  }

  private renderUserDefText(index: number) {
    const { userDefinitions } = this.props;
    const userDefinition = userDefinitions[userDefinitions.length - 1 - index];
    const i18n = this.context;
    if (!userDefinition) {
      return;
    }
    const playRecording = (recordingIndex: number) => {
      const logPlay = () => {
        this.context.log({
          event: "play submitted recording",
          recordingIndex
        });
      };
      if (this.currentAudio) {
        const {element} = this.currentAudio;

        // toggle current audio
        if (this.currentAudio.userDefinition === userDefinition) {
          if (element.paused) {
            logPlay();
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

      getAudio(userDefinition)
        .then(audio => {
          this.currentAudio = {
            element: audio,
            userDefinition
          };
          logPlay();
          this.currentAudio.element.play();
        })
        .catch(err => alert(err.toString()));
    };
    if (isAudioOrRecordingUrl(userDefinition)) {
      const recordingIndex = userDefinitions.filter(isAudioOrRecordingUrl).indexOf(userDefinition) + 1;
      return (
        <>
          {i18n.translate("audioDefinition", "Audio definition %{index}", {index: recordingIndex})}
          <span
            className={icons.iconButton + " " + icons.iconAudio}
            // tslint:disable-next-line:jsx-no-lambda
            onClick={() => playRecording(recordingIndex)}
            title={i18n.translate("playRecording")}
          />
        </>
      );
    }
    return userDefinition;
  }

  private toggleAllUserDefinitions = () => {
    const { allUserDefsVisible } = this.state;
    this.setState({
      allUserDefsVisible: !allUserDefsVisible,
    });
  }
}
