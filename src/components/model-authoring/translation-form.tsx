import * as React from "react";
import { useEffect, useState } from "react";
import { IGlossary, IGlossarySettings, IWordDefinition } from "../../types";
import { TermPopUpPreview } from "./term-popup-preview";
import { mp3UrlTerm, term, TextKey } from "../../utils/translation-utils";
import { ITranslatedWordDefinition } from "./glossary-translations";
import { allLanguages } from "./add-translation";
import { translate } from "../../i18n-context";

import * as css from "./shared-modal-form.scss";
import * as icons from "../common/icons.scss";

type ITranslatedWordDefinitionKey = keyof Pick<ITranslatedWordDefinition,
  "translatedWord" |
  "translatedDefinition" | "translatedDiggingDeeper" | "translatedImageCaption" | "translatedImageAltText" | "translatedVideoCaption" |
  "translatedVideoAltText" | "translatedClosedCaptionsUrl" | "translatedDiggingDeeperMP3Url" | "translatedDefinitionMP3Url" |
  "translatedImageCaptionMP3Url" | "translatedVideoCaptionMP3Url"
  >;
export type DefinitionTranslation = Record<string, string>

export type NextEditAction = ({type: "save"} | {type: "save and close"} | {type: "save and edit previous"} | {type: "save and edit next"}) & {lang: string};

type IProps = {
  lang: string
  glossary: IGlossary
  usedLangs: string[]
  translatedDefinition: ITranslatedWordDefinition
  canEdit: boolean;
  onEdit: (translatedDefinition: ITranslatedWordDefinition, definitionTranslation: DefinitionTranslation, lang: string, next: NextEditAction) => void
  onCancel: () => void;
}

export const TranslationForm = (props: IProps) => {
  const {canEdit} = props;
  const translations = props.glossary.translations || {}
  const formRef = React.useRef<HTMLFormElement>(null);
  const [previewTerm, setPreviewTerm] = useState<IWordDefinition>(props.translatedDefinition);
  const [lang, setLang] = useState(props.lang);
  const [previewTranslation, setPreviewTranslation] = useState<DefinitionTranslation>()
  const {word} = props.translatedDefinition;

  const getNewTranslation = () => {
    const newTranslation: DefinitionTranslation = {
      [term[TextKey.Word](word)]: getFormValue("translatedWord"),
      [term[TextKey.Definition](word)]: getFormValue("translatedDefinition"),
      [term[TextKey.DiggingDeeper](word)]: getFormValue("translatedDiggingDeeper"),
      [term[TextKey.ImageCaption](word)]: getFormValue("translatedImageCaption"),
      [term[TextKey.VideoCaption](word)]: getFormValue("translatedVideoCaption"),
      [term[TextKey.ImageAltText](word)]: getFormValue("translatedImageAltText"),
      [term[TextKey.VideoAltText](word)]: getFormValue("translatedVideoAltText"),
      [term[TextKey.ClosedCaptionsUrl](word)]: getFormValue("translatedClosedCaptionsUrl"),
      [mp3UrlTerm[TextKey.Definition](word)]: getFormValue("translatedDefinitionMP3Url"),
      [mp3UrlTerm[TextKey.ImageCaption](word)]: getFormValue("translatedImageCaptionMP3Url"),
      [mp3UrlTerm[TextKey.VideoCaption](word)]: getFormValue("translatedVideoCaptionMP3Url"),
      [mp3UrlTerm[TextKey.DiggingDeeper](word)]: getFormValue("translatedDiggingDeeperMP3Url"),
    }
    return newTranslation
  }

  const getTranslatedValue = (field: ITranslatedWordDefinitionKey) => {
    if (lang === props.lang) {
      return props.translatedDefinition[field]
    }
    switch (field) {
      case "translatedWord":
        return translate(translations, lang, term[TextKey.Word](word), "");
      case "translatedDefinition":
        return translate(translations, lang, term[TextKey.Definition](word), "");
      case "translatedDiggingDeeper":
        return translate(translations, lang, term[TextKey.DiggingDeeper](word), "");
      case "translatedImageCaption":
        return translate(translations, lang, term[TextKey.ImageCaption](word), "");
      case "translatedVideoCaption":
        return translate(translations, lang, term[TextKey.VideoCaption](word), "");
      case "translatedImageAltText":
        return translate(translations, lang, term[TextKey.ImageAltText](word), "");
      case "translatedVideoAltText":
        return translate(translations, lang, term[TextKey.VideoAltText](word), "");
      case "translatedDefinitionMP3Url":
        return translate(translations, lang, mp3UrlTerm[TextKey.Definition](word), "");
      case "translatedImageCaptionMP3Url":
        return translate(translations, lang, mp3UrlTerm[TextKey.ImageCaption](word), "");
      case "translatedVideoCaptionMP3Url":
        return translate(translations, lang, mp3UrlTerm[TextKey.VideoCaption](word), "");
      }
  }

  const getFormValue = (field: ITranslatedWordDefinitionKey) => {
    return ((formRef.current?.elements.namedItem(field) as HTMLInputElement|HTMLTextAreaElement)?.value || "").trim()
  }

  const handleEditSubmit = (next: NextEditAction) => {
    return (e: React.FormEvent<HTMLFormElement>|React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      props.onEdit(props.translatedDefinition, getNewTranslation(), lang, next)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    handleEditSubmit({type: "save", lang})(e)
  }

  const handleChangeLang = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLang(e.target.value)
  }

  const renderPreview = () => {
    const settings: IGlossarySettings = {...props.glossary, askForUserDefinition: false, enableStudentLanguageSwitching: false}
    const previewTranslations = {
      [lang]: previewTranslation || {}
    }
    return <TermPopUpPreview key={`${lang}-${previewTerm.word}`} term={previewTerm} settings={settings} translations={previewTranslations} lang={lang}/>
  }

  const handleFormChange = () => {
    if (canEdit) {
      setPreviewTranslation(getNewTranslation())
    }
  };

  const renderButtons = () => {
    if (canEdit) {
      return (
        <div className={css.buttons}>
          <button className={`${css.saveAnd} ${css.previous}`} onClick={handleEditSubmit({type: "save and edit previous", lang})}>
            <span className={icons.iconCaretLeft}/>
            Save &amp; Previous
          </button>
          <button onClick={props.onCancel}>Cancel</button>
          <button type="submit" onClick={handleEditSubmit({type: "save", lang})}>Save</button>
          <button type="submit" onClick={handleEditSubmit({type: "save and close", lang})}>Save &amp; Close</button>
          <button className={`${css.saveAnd} ${css.next}`} onClick={handleEditSubmit({type: "save and edit next", lang})}>
            Save &amp; Next
            <span className={icons.iconCaretRight}/>
          </button>
        </div>
      )
    } else {
      return (
        <div className={css.buttons}>
          <button onClick={props.onCancel}>Close</button>
        </div>
      )
    }
  }

  useEffect(() => {
    setPreviewTranslation(getNewTranslation())
  }, [formRef.current, lang])

  return (
    <div className={css.modalForm} key={lang}>
      <div className={css.left}>
        <div className={css.header}>
          <div>
            {canEdit ? "Edit" : "View"} {allLanguages[lang]} Translation: {word}
          </div>
          <div>
            <a href="https://docs.google.com/document/d/1HA8KaOHR3pd027UJKq96DK2TKUDA2-sYDIemZ94kN9g/edit?usp=sharing" target="_blank" rel="noopener noreferrer" title="Open Glossary Authoring Guide in a new tab">Help</a>
            <span onClick={props.onCancel} title="Close without saving" className={icons.iconCross}/>
          </div>
        </div>
        <form onSubmit={handleSubmit} onChange={handleFormChange} ref={formRef}>
          <div className={css.fieldset}>
            <legend>Language</legend>
            <div>
              <select value={lang} onChange={handleChangeLang}>
                {props.usedLangs.map(usedLang => <option key={usedLang} value={usedLang}>{allLanguages[usedLang]}</option>)}
              </select>
            </div>
          </div>
          <div className={css.fieldset}>
            <legend>Term</legend>
            <div>
              <input type="text" name="translatedWord" defaultValue={getTranslatedValue("translatedWord")} placeholder={`Translation for ${word}`} autoFocus={true} />
            </div>
          </div>
          <div className={css.fieldset}>
            <legend>Definition</legend>
            <div>
              <textarea name="translatedDefinition" defaultValue={getTranslatedValue("translatedDefinition")} placeholder={`Translated definition for ${word}`} className={css.definition} />
            </div>
          </div>
          <div className={css.fieldset}>
            <legend>Digging Deeper</legend>
            <div>
              <textarea name="translatedDiggingDeeper" defaultValue={getTranslatedValue("translatedDiggingDeeper")} placeholder={`Translated definition for ${word}`} className={css.diggingDeeper} />
            </div>
          </div>
          <div className={css.fieldset}>
            <legend>Image Caption</legend>
            <div>
              <textarea name="translatedImageCaption" defaultValue={getTranslatedValue("translatedImageCaption")} placeholder={`Translated image caption for ${word}`} />
            </div>
          </div>
          <div className={css.fieldset}>
            <legend>Image Alt Text</legend>
            <div>
              <textarea name="translatedImageAltText" defaultValue={getTranslatedValue("translatedImageAltText")} placeholder={`Translated alt text for ${word}`} />
            </div>
          </div>
          <div className={css.fieldset}>
            <legend>Video Caption</legend>
            <div>
              <textarea name="translatedVideoCaption" defaultValue={getTranslatedValue("translatedVideoCaption")} placeholder={`Translated video caption for ${word}`} />
            </div>
          </div>
          <div className={css.fieldset}>
            <legend>Video Alt Text</legend>
            <div>
              <textarea name="translatedVideoAltText" defaultValue={getTranslatedValue("translatedVideoAltText")} placeholder={`Translated video alt text for ${word}`} />
            </div>
          </div>
          <div className={css.fieldset}>
            <legend>Definition MP3 URL</legend>
            <div>
            <input type="text" name="translatedDefinitionMP3Url" defaultValue={getTranslatedValue("translatedDefinitionMP3Url")} placeholder={`MP3 recording of translated definition for ${word}`} />
            </div>
          </div>
          <div className={css.fieldset}>
            <legend>Digging Deeper MP3 URL</legend>
            <div>
            <input type="text" name="translatedDiggingDeeperMP3Url" defaultValue={getTranslatedValue("translatedDiggingDeeperMP3Url")} placeholder={`MP3 recording of translated Digging Deeper definition for ${word}`} />
            </div>
          </div>
          <div className={css.fieldset}>
            <legend>Image Caption MP3 URL</legend>
            <div>
            <input type="text" name="translatedImageCaptionMP3Url" defaultValue={getTranslatedValue("translatedImageCaptionMP3Url")} placeholder={`MP3 recording of translated image caption for ${word}`} />
            </div>
          </div>
          <div className={css.fieldset}>
            <legend>Video Caption MP3 URL</legend>
            <div>
            <input type="text" name="translatedVideoCaptionMP3Url" defaultValue={getTranslatedValue("translatedVideoCaptionMP3Url")} placeholder={`MP3 recording of translated video caption for ${word}`} />
            </div>
          </div>
          <div className={css.fieldset}>
            <div>
              <legend>Closed Captions URL</legend>
            </div>
            <div>
              <input type="text" name="closedCaptionsUrl" defaultValue={getTranslatedValue("translatedClosedCaptionsUrl")}/>
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
