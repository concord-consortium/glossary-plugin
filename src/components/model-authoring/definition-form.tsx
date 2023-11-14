import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { IGlossary, IGlossarySettings, IWordDefinition } from "../../types";
import { TermPopUpPreview } from "./term-popup-preview";
import UploadableInput from "./uploadable-input";

import * as css from "./shared-modal-form.scss";
import * as icons from "../common/icons.scss";

type IWordDefinitionKey = keyof IWordDefinition;
export type IWordDefinitionFormErrors = Partial<Record<IWordDefinitionKey, string>>;

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
  const {canEdit, selectedSecondLang, onSelectSecondLang} = props;
  const formRef = React.useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<IWordDefinitionFormErrors>({});
  const [definition, setDefinition] = useState<IWordDefinition>(props.type === "edit" ? props.definition : {word: "", definition: ""});

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const firstError = document.getElementById("form-field-error") as HTMLDivElement | undefined;
      const top = firstError?.offsetTop || 0;
      formRef.current?.scrollTo(0, top);
    }
  }, [errors, formRef.current]);

  const handleAddSubmit = (next: NextAddAction) => {
    return (e: React.FormEvent<HTMLFormElement>|React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      if (props.type === "add") {
        setErrors(props.onAdd(definition, next));
      }
    };
  };

  const handleEditSubmit = (next: NextEditAction) => {
    return (e: React.FormEvent<HTMLFormElement>|React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      if (props.type === "edit") {
        setErrors(props.onEdit(props.definition, definition, next));
      }
    };
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (props.type === "add") {
      handleAddSubmit("save")(e);
    } else {
      handleEditSubmit("save")(e);
    }
  };

  const handleFieldChange = (field: IWordDefinitionKey) => {
    return (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) =>
      setDefinition((prev) => ({...prev, [field]: e.target.value}));
  };

  const renderPreview = () => {
    // disable student definition in preview so definition is visible
    const settings: IGlossarySettings = {...props.glossary, askForUserDefinition: false};
    return (
      <TermPopUpPreview
        term={definition}
        settings={settings}
        translations={props.glossary.translations || {}}
        note="NOTE: This preview ignores the student-provided definitions setting in order to show the definition automatically."
        selectedSecondLang={selectedSecondLang}
        onSelectSecondLang={onSelectSecondLang}
      />
    );
  };

  const renderButtons = () => {
    if (!canEdit) {
      return (
        <div className={css.buttons}>
          <button onClick={props.onCancel}>Close</button>
        </div>
      );
    }
    else if (props.type === "add") {
      return (
        <div className={css.buttons}>
          <button onClick={props.onCancel}>Cancel</button>
          <button type="submit" onClick={handleAddSubmit("save")}>Save &amp; Close</button>
          <button onClick={handleAddSubmit("save and add another")}>Save &amp; Add Another</button>
        </div>
      );
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
      );
    }
  };

  const renderError = useCallback((field: IWordDefinitionKey) => {
    if (errors[field]) {
      return <div id="form-field-error" className={css.error}>{errors[field]}</div>;
    }
  }, [errors]);

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
        <form onSubmit={handleSubmit} ref={formRef}>
          <div className={css.fieldset}>
            <legend>Term</legend>
            <div>
              <input type="text" name="word" value={definition.word} autoFocus={props.type === "add"} onChange={handleFieldChange("word")} />
              {renderError("word")}
            </div>
          </div>
          <div className={css.fieldset}>
            <legend>Definition</legend>
            <div>
              <textarea name="definition" value={definition.definition} autoFocus={props.type === "edit"} className={css.definition} onChange={handleFieldChange("definition")} />
              {renderError("definition")}
            </div>
          </div>
          <div className={css.fieldset}>
            <div>
              <legend>Digging Deeper</legend>
              <legend className={css.note}>(Optional)</legend>
            </div>
            <div>
              <textarea name="diggingDeeper" value={definition.diggingDeeper} className={css.diggingDeeper} onChange={handleFieldChange("diggingDeeper")} />
              {renderError("diggingDeeper")}
            </div>
          </div>
          <div className={css.fieldset}>
            <div>
              <legend>Image URL</legend>
              <legend className={css.note}>(Optional)</legend>
            </div>
            <div>
              <UploadableInput type="image" name="image" value={definition.image} onChange={handleFieldChange("image")} />
              {renderError("image")}
            </div>
          </div>
          <div className={css.fieldset}>
            <div>
              <legend>Image Alt Text</legend>
              <legend className={css.note}>(Optional)</legend>
            </div>
            <div>
              <textarea name="imageAltText" value={definition.imageAltText} onChange={handleFieldChange("imageAltText")} />
              {renderError("imageAltText")}
            </div>
          </div>
          <div className={css.fieldset}>
            <div>
              <legend>Zoom Image URL</legend>
              <legend className={css.note}>(Optional)</legend>
            </div>
            <div>
              <UploadableInput type="image" name="zoomImage" value={definition.zoomImage} onChange={handleFieldChange("zoomImage")} />
              {renderError("zoomImage")}
            </div>
          </div>
          <div className={css.fieldset}>
            <div>
              <legend>Image Caption</legend>
              <legend className={css.note}>(Optional)</legend>
            </div>
            <div>
              <textarea name="imageCaption" value={definition.imageCaption} onChange={handleFieldChange("imageCaption")} />
              {renderError("imageCaption")}
            </div>
          </div>
          <div className={css.fieldset}>
            <div>
              <legend>Video URL</legend>
              <legend className={css.note}>(Optional)</legend>
            </div>
            <div>
              <UploadableInput type="video" name="video" value={definition.video} onChange={handleFieldChange("video")} />
              {renderError("video")}
            </div>
          </div>
          <div className={css.fieldset}>
            <div>
              <legend>Video Alt Text</legend>
              <legend className={css.note}>(Optional)</legend>
            </div>
            <div>
              <textarea name="videoAltText" value={definition.videoAltText} onChange={handleFieldChange("videoAltText")} />
              {renderError("videoAltText")}
            </div>
          </div>
          <div className={css.fieldset}>
            <div>
              <legend>Video Caption</legend>
              <legend className={css.note}>(Optional)</legend>
            </div>
            <div>
              <textarea name="videoCaption" value={definition.videoCaption} onChange={handleFieldChange("videoCaption")} />
              {renderError("videoCaption")}
            </div>
          </div>
          <div className={css.fieldset}>
            <div>
              <legend>Closed Captions URL</legend>
              <legend className={css.note}>(Optional)</legend>
            </div>
            <div>
              <UploadableInput type="closed captions" name="closedCaptionsUrl" value={definition.closedCaptionsUrl} onChange={handleFieldChange("closedCaptionsUrl")} />
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
