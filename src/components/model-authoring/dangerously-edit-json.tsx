import * as React from "react";
import { useRef } from "react";
import { IGlossary } from "../../types";

import * as css from "./dangerously-edit-json.scss";

interface IProps {
  glossary: IGlossary;
  saveGlossary: (glossary: IGlossary) => void;
}

export const DangerouslyEditJson = ({ glossary, saveGlossary }: IProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSave = () => {
    try {
      const newGlossary = JSON.parse(textareaRef.current?.value || "{}");
      saveGlossary(newGlossary);
    } catch (e) {
      alert(`Error parsing JSON: ${e.message}`);
    }
  }

  return (
    <div className={css.dangerouslyEditJson}>
      <div>DANGEROUS! Only use this if you know what you are doing. No validation is done to ensure the JSON is correct when saved!</div>
      <textarea defaultValue={JSON.stringify(glossary, null, 2)} ref={textareaRef} />
      <button onClick={handleSave}>Save Edited JSON</button>
    </div>
  )
}
