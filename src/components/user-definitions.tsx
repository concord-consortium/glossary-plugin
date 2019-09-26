import * as React from "react";
import { i18nContext } from "../i18n-context";
import * as css from "./user-definitions.scss";
import * as icons from "./icons.scss";

interface IProps {
  userDefinitions: string[];
}

interface IState {
  allUserDefsVisible: boolean;
}

const getOrdinal = (n: number, max: number) => {
  if (n === 0 || n === 1) {
    return ""; // current or previous
  }
  return max - n;
};

export default class UserDefinitions extends React.Component<IProps, IState> {
  public static contextType = i18nContext;

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
