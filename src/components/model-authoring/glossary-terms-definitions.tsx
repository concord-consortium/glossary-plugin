import * as React from "react";
import { useState } from "react";
import { IGlossary, IWordDefinition } from "../../types";
import { Panel } from "./panel";

import * as css from "./glossary-terms-definitions.scss";

interface IProps {
  glossary: IGlossary;
  saveDefinitions: (definitions: IWordDefinition[]) => void;
}

export const GlossaryTermsDefinitions = ({ glossary }: IProps) => {
  const [showContent, setShowContent] = useState<boolean>(true);

  const handleClick = () => setShowContent(prev => !prev);

  return (
    <Panel label="Glossary Terms & Definitions" collapsible={true} minHeight={500} contentClassName={css.glossaryTermsDefinitions} >
      <div>TODO</div>
    </Panel>
  )
}