import * as React from "react";
import { useState } from "react";
import { IGlossary, IWordDefinition } from "../../types";

import * as css from "./glossary-terms-definitions.scss";

interface IProps {
  glossary: IGlossary;
  saveDefinitions: (definitions: IWordDefinition[]) => void;
}

export const GlossaryTermsDefinitions = ({ glossary }: IProps) => {
  const [showContent, setShowContent] = useState<boolean>(true);

  const handleClick = () => {
    setShowContent(!showContent);
  }

  return (
    <>
      <div className={css.header}>
        <h1>Glossary Terms & Definitions</h1>
        <button onClick={handleClick}>{showContent ? "v" : "˄"}</button>  {/* using text for now but it looks like we need an icon asset  */}
      </div>
      {showContent &&
        <pre className={css.content}>{glossary.definitions}</pre>
      }
    </>
  )
}