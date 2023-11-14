import * as React from "react";
import { ExpandableInteraction } from "../../types";
import { INTERACTIONS } from "../../utils/usage-stats-helpers";

import * as css from "./term-interactions.scss";
import * as icons from "../common/icons.scss";

interface IProps {
  term: string;
  expanded: boolean;
  showFullPrompts: boolean;
  expandedInteractions: {[interaction: string]: boolean | undefined};
  setInteractionExpanded: (term: string, interaction: ExpandableInteraction, val: boolean) => void;
  width: string;
}

export default class StatsTable extends React.Component<IProps, {}> {
  public render() {
    const { term, expanded, width, expandedInteractions, showFullPrompts } = this.props;
    return (
      <div className={css.termInteractions} style={{minWidth: width, width}}>
        <div className={css.content}>
          {
            expanded && INTERACTIONS.map(int => {
              const interactionIsExpanded = expandedInteractions[int.name];
              const promptExpanded = showFullPrompts || interactionIsExpanded;
              if (promptExpanded) {
                const headerClassName = `${css.interactionPrompt} ${css.fullPrompt}`;
                return (
                  <div
                    key={int.name}
                    className={headerClassName}
                    onClick={this.setInteractionExpanded.bind(this, term, int.name, false)}
                  >
                    {int.label}
                    <span className={icons.iconShrink2} />
                  </div>
                );
              } else {
                const headerClassName = `${css.interactionPrompt} ${int.expandable ? css.clickable : ""}`;
                return (
                  <div
                    key={int.name}
                    className={headerClassName}
                    onClick={int.expandable ? this.setInteractionExpanded.bind(this, term, int.name, true) : undefined}
                  >
                    {int.label}
                    {int.expandable && <span className={icons.iconEnlarge2} />}
                  </div>
                );
              }
            })
          }
          {
            // Fake interaction prompt, just to add cell with the border.
            !expanded && <div className={`${css.interactionPrompt} ${css.blankCell}`} />}
        </div>
      </div>
    );
  }

  private setInteractionExpanded = (term: string, interaction: ExpandableInteraction, val: boolean) => {
    const { setInteractionExpanded } = this.props;
    setInteractionExpanded(term, interaction, val);
  };
}
