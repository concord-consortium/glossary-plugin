import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { IGlossary, IGlossarySettings, IWordDefinition } from "../../types";
import { TermPopUpPreview } from "./term-popup-preview";
import { mp3UrlTerm, term, TextKey } from "../../utils/translation-utils";
import { ITranslatedWordDefinition } from "./glossary-translations";
import { allLanguages } from "./add-translation";
import { translate } from "../../i18n-context";
import UploadableInput from "./uploadable-input";

import * as css from "./shared-modal-form.scss";
import * as icons from "../common/icons.scss";

type ITranslatedWordDefinitionKey = keyof Pick<ITranslatedWordDefinition,
  "translatedWord" |
  "translatedDefinition" | "translatedDiggingDeeper" | "translatedImageCaption" | "translatedImageAltText" | "translatedVideoCaption" |
  "translatedVideoAltText" | "translatedClosedCaptionsUrl" | "translatedDiggingDeeperMP3Url" | "translatedDefinitionMP3Url" |
  "translatedImageCaptionMP3Url" | "translatedVideoCaptionMP3Url"
  >;
export type TranslationFields = Record<ITranslatedWordDefinitionKey, string>
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
  const [lang, setLang] = useState(props.lang);
  const [translation, setTranslation] = useState<TranslationFields>(props.translatedDefinition);
  const {word} = props.translatedDefinition;

  useEffect(() => {
    setTranslation({
      translatedWord: translate(translations, lang, term[TextKey.Word](word), ""),
      translatedDefinition: translate(translations, lang, term[TextKey.Definition](word), ""),
      translatedDiggingDeeper: translate(translations, lang, term[TextKey.DiggingDeeper](word), ""),
      translatedImageCaption: translate(translations, lang, term[TextKey.ImageCaption](word), ""),
      translatedVideoCaption: translate(translations, lang, term[TextKey.VideoCaption](word), ""),
      translatedImageAltText: translate(translations, lang, term[TextKey.ImageAltText](word), ""),
      translatedVideoAltText: translate(translations, lang, term[TextKey.VideoAltText](word), ""),
      translatedClosedCaptionsUrl: translate(translations, lang, term[TextKey.ClosedCaptionsUrl](word), ""),
      translatedDefinitionMP3Url: translate(translations, lang, mp3UrlTerm[TextKey.Definition](word), ""),
      translatedImageCaptionMP3Url: translate(translations, lang, mp3UrlTerm[TextKey.ImageCaption](word), ""),
      translatedVideoCaptionMP3Url: translate(translations, lang, mp3UrlTerm[TextKey.VideoCaption](word), ""),
      translatedDiggingDeeperMP3Url: translate(translations, lang, mp3UrlTerm[TextKey.DiggingDeeper](word), ""),
    })
  }, [lang, word, translations]);

  const getNewTranslation = useCallback(() => {
    const newTranslation: DefinitionTranslation = {
      [term[TextKey.Word](word)]: translation.translatedWord,
      [term[TextKey.Definition](word)]: translation.translatedDefinition,
      [term[TextKey.DiggingDeeper](word)]: translation.translatedDiggingDeeper,
      [term[TextKey.ImageCaption](word)]: translation.translatedImageCaption,
      [term[TextKey.VideoCaption](word)]: translation.translatedVideoCaption,
      [term[TextKey.ImageAltText](word)]: translation.translatedImageAltText,
      [term[TextKey.VideoAltText](word)]: translation.translatedVideoAltText,
      [term[TextKey.ClosedCaptionsUrl](word)]: translation.translatedClosedCaptionsUrl,
      [mp3UrlTerm[TextKey.Definition](word)]: translation.translatedDefinitionMP3Url,
      [mp3UrlTerm[TextKey.ImageCaption](word)]: translation.translatedImageCaptionMP3Url,
      [mp3UrlTerm[TextKey.VideoCaption](word)]: translation.translatedVideoCaptionMP3Url,
      [mp3UrlTerm[TextKey.DiggingDeeper](word)]: translation.translatedDiggingDeeperMP3Url,
    }
    return newTranslation
  }, [translation])

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
    props.onEdit(props.translatedDefinition, getNewTranslation(), lang, {type: "save", lang: e.target.value})
    setLang(e.target.value)
  }

  const renderPreview = () => {
    const settings: IGlossarySettings = {...props.glossary, askForUserDefinition: false, enableStudentLanguageSwitching: false}
    const previewTranslations = {
      [lang]: getNewTranslation() || {}
    }
    return <TermPopUpPreview key={`${lang}-${word}`} term={props.translatedDefinition} settings={settings} translations={previewTranslations} lang={lang}/>
  }

  const handleFieldChange = useCallback((field: ITranslatedWordDefinitionKey) => {
    return (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
      setTranslation({...translation, [field]: e.target.value})
    }
  }, [translation])

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
        <form onSubmit={handleSubmit} ref={formRef}>
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
              <input
                type="text"
                name="translatedWord"
                value={translation.translatedWord}
                placeholder={`Translation for ${word}`}
                autoFocus={true}
                onChange={handleFieldChange("translatedWord")}
              />
            </div>
          </div>
          <div className={css.fieldset}>
            <legend>Definition</legend>
            <div>
              <textarea
                name="translatedDefinition"
                value={translation.translatedDefinition}
                placeholder={`Translated definition for ${word}`}
                className={css.definition}
                onChange={handleFieldChange("translatedDefinition")}
              />
            </div>
          </div>
          <div className={css.fieldset}>
            <legend>Digging Deeper</legend>
            <div>
              <textarea
                name="translatedDiggingDeeper"
                value={translation.translatedDiggingDeeper}
                placeholder={`Translated digging deeper text for ${word}`}
                className={css.diggingDeeper}
                onChange={handleFieldChange("translatedDiggingDeeper")}
              />
            </div>
          </div>
          <div className={css.fieldset}>
            <legend>Image Caption</legend>
            <div>
              <textarea
                name="translatedImageCaption"
                value={translation.translatedImageCaption}
                placeholder={`Translated image caption for ${word}`}
                onChange={handleFieldChange("translatedImageCaption")}
              />
            </div>
          </div>
          <div className={css.fieldset}>
            <legend>Image Alt Text</legend>
            <div>
              <textarea
                name="translatedImageAltText"
                value={translation.translatedImageAltText}
                placeholder={`Translated alt text for ${word}`}
                onChange={handleFieldChange("translatedImageAltText")}
              />
            </div>
          </div>
          <div className={css.fieldset}>
            <legend>Video Caption</legend>
            <div>
              <textarea
                name="translatedVideoCaption"
                value={translation.translatedVideoCaption}
                placeholder={`Translated video caption for ${word}`}
                onChange={handleFieldChange("translatedVideoCaption")}
              />
            </div>
          </div>
          <div className={css.fieldset}>
            <legend>Video Alt Text</legend>
            <div>
              <textarea
                name="translatedVideoAltText"
                value={translation.translatedVideoAltText}
                placeholder={`Translated video alt text for ${word}`}
                onChange={handleFieldChange("translatedVideoAltText")}
              />
            </div>
          </div>
          <div className={css.fieldset}>
            <legend>Definition MP3 URL</legend>
            <div>
              <UploadableInput
                type="audio"
                name="translatedDefinitionMP3Url"
                value={translation.translatedDefinitionMP3Url}
                placeholder={`MP3 recording of translated definition for ${word}`}
                onChange={handleFieldChange("translatedDefinitionMP3Url")}
              />
            </div>
          </div>
          <div className={css.fieldset}>
            <legend>Digging Deeper MP3 URL</legend>
            <div>
              <UploadableInput
                type="audio"
                name="translatedDiggingDeeperMP3Url"
                value={translation.translatedDiggingDeeperMP3Url}
                placeholder={`MP3 recording of translated Digging Deeper definition for ${word}`}
                onChange={handleFieldChange("translatedDiggingDeeperMP3Url")}
              />
            </div>
          </div>
          <div className={css.fieldset}>
            <legend>Image Caption MP3 URL</legend>
            <div>
              <UploadableInput
                type="audio"
                name="translatedImageCaptionMP3Url"
                value={translation.translatedImageCaptionMP3Url}
                placeholder={`MP3 recording of translated image caption for ${word}`}
                onChange={handleFieldChange("translatedImageCaptionMP3Url")}
              />
            </div>
          </div>
          <div className={css.fieldset}>
            <legend>Video Caption MP3 URL</legend>
            <div>
              <UploadableInput
                type="audio"
                name="translatedVideoCaptionMP3Url"
                value={translation.translatedVideoCaptionMP3Url}
                placeholder={`MP3 recording of translated video caption for ${word}`}
                onChange={handleFieldChange("translatedVideoCaptionMP3Url")}
              />
            </div>
          </div>
          <div className={css.fieldset}>
            <div>
              <legend>Closed Captions URL</legend>
            </div>
            <div>
              <UploadableInput
                type="closed captions"
                name="translatedClosedCaptionsUrl"
                value={translation.translatedClosedCaptionsUrl}
                placeholder={`Translated closed captions url ${word}`}
                onChange={handleFieldChange("translatedClosedCaptionsUrl")}
              />
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
