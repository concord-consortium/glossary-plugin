import * as React from "react";
import Definition from "./definition";
import { IWordDefinition, ILearnerDefinitions } from "./types";

import * as css from "./glossary-sidebar.scss";

interface IGlossarySidebarProps {
  definitions: IWordDefinition[];
  learnerDefinitions: ILearnerDefinitions;
}

// interface IGlossarySidebarState {
// }

export default class GlossarySidebar extends React.Component<IGlossarySidebarProps, {}> {
  public render() {
    const { definitions, learnerDefinitions } = this.props;
    return (
      <div>
        {
          definitions.map((entry: IWordDefinition) =>
            <div className={css.entry}>
              <div className={css.word}>{ entry.word }</div>
              <div className={css.definition}>
                <Definition
                  definition={entry.definition}
                  userDefinitions={learnerDefinitions[entry.word]}
                  imageUrl={entry.image}
                  videoUrl={entry.video}
                  imageCaption={entry.imageCaption}
                  videoCaption={entry.videoCaption}
                />
              </div>
            </div>
          )
        }
      </div>
    );
  }
}
