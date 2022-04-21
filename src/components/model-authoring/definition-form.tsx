import * as React from "react";
import { useCallback, useState } from "react";
import { IGlossary, IGlossarySettings, IWordDefinition } from "../../types";
import { TermPopUpPreview } from "./term-popup-preview";

import * as css from "./shared-modal-form.scss";

type IWordDefinitionKey = keyof IWordDefinition;
export type IWordDefinitionFormErrors = Partial<Record<IWordDefinitionKey, string>>

export type NextAddAction = "save" | "save and add another";
export type NextEditAction = "save" | "save and edit previous" | "save and edit next";

interface IAddProps {
  type: "add";
  onAdd: (newDefinition: IWordDefinition, next: NextAddAction) => IWordDefinitionFormErrors;
  onCancel: () => void;
}

interface IEditProps {
  type: "edit";
  definition: IWordDefinition
  onEdit: (existingDefinition: IWordDefinition, updatedDefinition: IWordDefinition, next: NextEditAction) => IWordDefinitionFormErrors
  onCancel: () => void;
}

type IProps = (IAddProps | IEditProps) & {glossary: IGlossary}

export const DefinitionForm = (props: IProps) => {
  const formRef = React.useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<IWordDefinitionFormErrors>({});
  const [previewTerm, setPreviewTerm] = useState<IWordDefinition>(props.type === "edit" ? props.definition : {word: "", definition: ""});

  const getNewDefinition = () => {
    const newDefinition: IWordDefinition = {
      word: getFormValue("word"),
      definition: getFormValue("definition"),
      diggingDeeper: getFormValue("diggingDeeper"),
      image: getFormValue("image"),
      zoomImage: getFormValue("zoomImage"),
      video: getFormValue("video"),
      imageCaption: getFormValue("imageCaption"),
      videoCaption: getFormValue("videoCaption"),
    }
    return newDefinition
  }

  const getSavedValue = (field: IWordDefinitionKey) => {
    return props.type === "edit" ? props.definition[field] : ""
  }

  const getFormValue = (field: IWordDefinitionKey) => {
    return ((formRef.current?.elements.namedItem(field) as HTMLInputElement|HTMLTextAreaElement)?.value || "").trim()
  }

  const handleAddSubmit = (next: NextAddAction) => {
    return (e: React.FormEvent<HTMLFormElement>|React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      const newDefinition = getNewDefinition()
      if (props.type === "add") {
        setErrors(props.onAdd(newDefinition, next))
      }
    }
  }

  const handleEditSubmit = (next: NextEditAction) => {
    return (e: React.FormEvent<HTMLFormElement>|React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      const newDefinition = getNewDefinition()
      if (props.type === "edit") {
        setErrors(props.onEdit(props.definition, newDefinition, next))
      }
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (props.type === "add") {
      handleAddSubmit("save")(e)
    } else {
      handleEditSubmit("save")(e)
    }
  }

  const renderPreview = () => {
    // disable student definition in preview so defintion is visible
    const settings: IGlossarySettings = {...props.glossary, askForUserDefinition: false}
    return (
      <TermPopUpPreview
        term={previewTerm}
        settings={settings}
        translations={props.glossary.translations || {}}
        note="NOTE: This preview ignores the student-provided definitions setting in order to show the definition automatically."
      />
    )
  }

  const renderButtons = () => {
    if (props.type === "add") {
      return (
        <div className={css.buttons}>
          <button onClick={props.onCancel}>Cancel</button>
          <button type="submit" onClick={handleAddSubmit("save")}>Save &amp; Close</button>
          <button onClick={handleAddSubmit("save and add another")}>Save &amp; Add Another</button>
        </div>
      )
    } else {
      return (
        <div className={css.buttons}>
          <button onClick={handleEditSubmit("save and edit previous")}>&lt;&lt; Save &amp; Previous</button>
          <button onClick={props.onCancel}>Cancel</button>
          <button type="submit" onClick={handleEditSubmit("save")}>Save &amp; Close</button>
          <button onClick={handleEditSubmit("save and edit next")}>Save &amp; Next &gt;&gt;</button>
        </div>
      )
    }
  }

  const renderError = useCallback((field: IWordDefinitionKey) => {
    if (errors[field]) {
      return <div className={css.error}>{errors[field]}</div>
    }
  }, [errors]);

  const handleFormChange = () => {
    setPreviewTerm(getNewDefinition())
  };

  return (
    <div className={css.modalForm}>
      <div className={css.left}>
        <div className={css.header}>
          <div>
            {props.type === "add" ? "Add New Term" : `Edit Term: ${props.definition.word}`}
          </div>
          <div>
            <a href="https://docs.google.com/document/d/1HA8KaOHR3pd027UJKq96DK2TKUDA2-sYDIemZ94kN9g/edit?usp=sharing" target="_blank" rel="noopener noreferrer" title="Open Glossary Authoring Guide in a new tab">Help</a>
            <span onClick={props.onCancel} title="Close without saving"><strong>X</strong></span>
          </div>
        </div>
        <form onSubmit={handleSubmit} onChange={handleFormChange} ref={formRef}>
          <div className={css.fieldset}>
            <legend>Term</legend>
            <div>
              <input type="text" name="word" defaultValue={getSavedValue("word")} autoFocus={props.type === "add"} />
              {renderError("word")}
            </div>
          </div>
          <div className={css.fieldset}>
            <legend>Definition</legend>
            <div>
              <textarea name="definition" defaultValue={getSavedValue("definition")} autoFocus={props.type === "edit"} className={css.definition} />
              {renderError("definition")}
            </div>
          </div>
          <div className={css.fieldset}>
            <div>
              <legend>Digging Deeper</legend>
              <legend className={css.note}>(Optional)</legend>
            </div>
            <div>
              <textarea name="diggingDeeper" defaultValue={getSavedValue("diggingDeeper")} autoFocus={props.type === "edit"} className={css.diggingDeeper} />
              {renderError("diggingDeeper")}
            </div>
          </div>
          <div className={css.fieldset}>
            <div>
              <legend>Image URL</legend>
              <legend className={css.note}>(Optional)</legend>
            </div>
            <div>
              <input type="text" name="image" defaultValue={getSavedValue("image")} />
              {renderError("image")}
            </div>
          </div>
          <div className={css.fieldset}>
            <div>
              <legend>Zoom Image URL</legend>
              <legend className={css.note}>(Optional)</legend>
            </div>
            <div>
              <input type="text" name="zoomImage" defaultValue={getSavedValue("zoomImage")}/>
              {renderError("zoomImage")}
            </div>
          </div>
          <div className={css.fieldset}>
            <div>
              <legend>Image Caption</legend>
              <legend className={css.note}>(Optional)</legend>
            </div>
            <div>
              <textarea name="imageCaption" defaultValue={getSavedValue("imageCaption")}/>
              {renderError("imageCaption")}
            </div>
          </div>
          <div className={css.fieldset}>
            <div>
              <legend>Video URL</legend>
              <legend className={css.note}>(Optional)</legend>
            </div>
            <div>
              <input type="text" name="video" defaultValue={getSavedValue("video")}/>
              {renderError("video")}
            </div>
          </div>
          <div className={css.fieldset}>
            <div>
              <legend>Video Caption</legend>
              <legend className={css.note}>(Optional)</legend>
            </div>
            <div>
              <textarea name="videoCaption" defaultValue={getSavedValue("videoCaption")}/>
              {renderError("videoCaption")}
            </div>
          </div>
        </form>
        {renderButtons()}
      </div>
      <div className={css.right}>
        {renderPreview()}
      </div>
    </div>
  );
};
