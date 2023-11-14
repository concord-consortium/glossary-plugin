import * as React from "react";
import * as css from "./term-name.scss";
import * as icons from "../common/icons.scss";

interface IProps {
  term: string;
  expanded: boolean;
  width: string;
  setTermExpanded: (term: string, expanded: boolean) => void;
}

export default class TermName extends React.Component<IProps, {}> {
  public render() {
    const { term, width, expanded } = this.props;
    return (
      <div className={css.termName} onClick={this.onTermNameClick} style={{ width }} data-cy="termName">
        <div className={css.content}>
          <div className={css.name}>
            Term: {term}
          </div>
          <div className={css.icon}>
            <span className={expanded ? icons.iconShrink2 : icons.iconEnlarge2} />
          </div>
        </div>
      </div>
    );
  }

  private onTermNameClick = () => {
    const { term, expanded, setTermExpanded } = this.props;
    setTermExpanded(term, !expanded);
  };
}
