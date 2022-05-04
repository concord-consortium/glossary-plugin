import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { IGlossary, IGlossarySettings, IWordDefinition } from "../../types";
import { TermPopUpPreview } from "./term-popup-preview";
import UploadableInput from "./uploadable-input";

import * as css from "./shared-modal-form.scss";
import * as icons from "../common/icons.scss";

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

type IProps = (IAddProps | IEditProps) & {glossary: IGlossary; canEdit: boolean, selectedSecondLang: string, onSelectSecondLang: (lang: string) => void};

export const DefinitionForm = (props: IProps) => {
  const {canEdit, selectedSecondLang, onSelectSecondLang} = props
  const formRef = React.useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<IWordDefinitionFormErrors>({});
  const [previewTerm, setPreviewTerm] = useState<IWordDefinition>(props.type === "edit" ? props.definition : {word: "", definition: ""});

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      formRef.current?.scrollTo(0, 0);
    }
  }, [errors, formRef.current]);

  const getNewDefinition = () => {
    const newDefinition: IWordDefinition = {
      word: getFormValue("word"),
      definition: getFormValue("definition"),
      diggingDeeper: getFormValue("diggingDeeper"),
      image: getFormValue("image"),
      zoomImage: getFormValue("zoomImage"),
      video: getFormValue("video"),
      imageCaption: getFormValue("imageCaption"),
      imageAltText: getFormValue("imageAltText"),
      videoCaption: getFormValue("videoCaption"),
      videoAltText: getFormValue("videoAltText"),
      closedCaptionsUrl: getFormValue("closedCaptionsUrl")
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
    // disable student definition in preview so definition is visible
    const settings: IGlossarySettings = {...props.glossary, askForUserDefinition: false}
    return (
      <TermPopUpPreview
        term={previewTerm}
        settings={settings}
        translations={props.glossary.translations || {}}
        note="NOTE: This preview ignores the student-provided definitions setting in order to show the definition automatically."
        selectedSecondLang={selectedSecondLang}
        onSelectSecondLang={onSelectSecondLang}
      />
    )
  }

  const renderButtons = () => {
    if (!canEdit) {
      return (
        <div className={css.buttons}>
          <button onClick={props.onCancel}>Close</button>
        </div>
      )
    }
    else if (props.type === "add") {
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
          <button className={`${css.saveAnd} ${css.previous}`} onClick={handleEditSubmit("save and edit previous")}>
            <span className={icons.iconCaretLeft}/>
            <div>Save &amp; Previous</div>
          </button>
          <button onClick={props.onCancel}>Cancel</button>
          <button type="submit" onClick={handleEditSubmit("save")}>Save &amp; Close</button>
          <button className={`${css.saveAnd} ${css.next}`} onClick={handleEditSubmit("save and edit next")}>
            <div>Save &amp; Next</div>
            <span className={icons.iconCaretRight}/>
          </button>
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
    if (canEdit) {
      setPreviewTerm(getNewDefinition())
    }
  };

  return (
    <div className={css.modalForm}>
      <div className={css.left}>
        <div className={css.header}>
          <div>
            {props.type === "add" ? "Add New Term" : `${canEdit ? "Edit" : "View"} Term: ${props.definition.word}`}
          </div>
          <div>
            <a href="https://docs.google.com/document/d/1HA8KaOHR3pd027UJKq96DK2TKUDA2-sYDIemZ94kN9g/edit?usp=sharing" target="_blank" rel="noopener noreferrer" title="Open Glossary Authoring Guide in a new tab">Help</a>
            <span onClick={props.onCancel} title="Close without saving" className={icons.iconCross}/>
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
              <textarea name="diggingDeeper" defaultValue={getSavedValue("diggingDeeper")} className={css.diggingDeeper} />
              {renderError("diggingDeeper")}
            </div>
          </div>
          <div className={css.fieldset}>
            <div>
              <legend>Image URL</legend>
              <legend className={css.note}>(Optional)</legend>
            </div>
            <div>
              <UploadableInput type="image" name="image" defaultValue={getSavedValue("image")} />
              {renderError("image")}
            </div>
          </div>
          <div className={css.fieldset}>
            <div>
              <legend>Image Alt Text</legend>
              <legend className={css.note}>(Optional)</legend>
            </div>
            <div>
              <textarea name="imageAltText" defaultValue={getSavedValue("imageAltText")}/>
              {renderError("imageAltText")}
            </div>
          </div>
          <div className={css.fieldset}>
            <div>
              <legend>Zoom Image URL</legend>
              <legend className={css.note}>(Optional)</legend>
            </div>
            <div>
              <UploadableInput type="image" name="zoomImage" defaultValue={getSavedValue("zoomImage")} />
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
              <UploadableInput type="video" name="video" defaultValue={getSavedValue("video")}/>
              {renderError("video")}
            </div>
          </div>
          <div className={css.fieldset}>
            <div>
              <legend>Video Alt Text</legend>
              <legend className={css.note}>(Optional)</legend>
            </div>
            <div>
              <textarea name="videoAltText" defaultValue={getSavedValue("videoAltText")}/>
              {renderError("videoAltText")}
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
          <div className={css.fieldset}>
            <div>
              <legend>Closed Captions URL</legend>
              <legend className={css.note}>(Optional)</legend>
            </div>
            <div>
              <UploadableInput type="closed captions" name="videoClosedCaptions" defaultValue={getSavedValue("closedCaptionsUrl")}/>
              {renderError("closedCaptionsUrl")}
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
