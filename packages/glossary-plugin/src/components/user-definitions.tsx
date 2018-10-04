import * as React from "react";
import * as css from "./user-definitions.scss";
import * as icons from "./icons.scss";

interface IProps {
  userDefinitions: string[];
}

interface IState {
  allUserDefsVisible: boolean;
}

const getOrdinal = (n: number, max: number) => {
  if (n === 0) {
    return ""; // current
  }
  if (n === 1) {
    return "previous";
  }
  n = max - n;
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export default class UserDefinitions extends React.Component<IProps, IState> {
  public state: IState = {
    allUserDefsVisible: false
  };

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
    if (!userDefinitions) {
      return;
    }
    return (
      <span className={css.userDefinition} key={index}>
        <div className={css.userDefinitionHeader}>
          My {getOrdinal(index, userDefinitions.length)} definition:
        </div>
        {userDefinitions[userDefinitions.length - 1 - index]}
      </span>
    );
  }

  private toggleAllUserDefinitions = () => {
    const { allUserDefsVisible } = this.state;
    this.setState({
      allUserDefsVisible: !allUserDefsVisible,
    });
  }
}
