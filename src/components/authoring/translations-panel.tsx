import * as React from "react";
import Button from "../button";
import Dropzone from "react-dropzone";
import { IGlossary } from "../types";
import { saveAs } from "file-saver";
import * as clone from "clone";
import { POEDITOR_LANG_CODE, POEDITOR_LANG_NAME } from "../../utils/poeditor-language-list";
import { glossaryToPOEditorTerms, isTranslationComplete } from "../../utils/translation-utils";

import * as css from "./translation-panel.scss";

interface IProps {
  glossary: IGlossary;
  onGlossaryUpdate: (glossary: IGlossary) => void;
}

interface IState {
  selectedLang: null;
}

const LANG_REGEXP = new RegExp(Object.keys(POEDITOR_LANG_CODE).join("|"));

const wrongFileTypeAlert = (rejected: File[]) => {
  alert(`File ${rejected[0].name} can't be uploaded. Please use one of the supported file types.`);
};

export default class TranslationsPanel extends React.Component<IProps, IState> {
  public render() {
    const { glossary } = this.props;
    const { translations } = glossary;
    const definedLanguages = translations && Object.keys(translations);
    return(
      <div>
        <h2>Translations</h2>
        <Button label="Export POEditor terms" data-cy="exportTerms" onClick={this.exportPOEditorJSON}/>
        <div>
          <Dropzone
            data-cy={"langUpload"}
            className={css.dropzone}
            activeClassName={css.dropzoneActive}
            rejectClassName={css.dropzoneReject}
            accept="application/json"
            multiple={true}
            onDropAccepted={this.handleLanguageUpload}
            onDropRejected={wrongFileTypeAlert}
          >
            Drop POEditor <b>JSON key-value</b> language files here, or click to select files to upload.
            Language will be detected using the filename, so please don't change it after exporting from POEditor.
            Multiple files can be dropped or selected at once.
          </Dropzone>
        </div>
        {
          definedLanguages && definedLanguages.length > 0 &&
          <div className={css.availableTranslations}>
            <div>Available translations:</div>
            <table>
              <tbody>
            {
              definedLanguages.map(langCode =>
                <tr key={langCode}>
                  <td><b>{POEDITOR_LANG_NAME[langCode]}</b></td>
                  <td>{isTranslationComplete(glossary, langCode) ?
                      "up to date ✓" : "some strings haven't been translated ✖"}</td>
                  <td><Button label="Remove" onClick={this.removeTranslation.bind(this, langCode)}/></td>
                </tr>)
            }
              </tbody>
            </table>
          </div>
        }
      </div>
    );
  }

  public handleLanguageUpload = (acceptedFiles: File[]) => {
    const { glossary } = this.props;
    const newGlossary = clone(glossary);
    const fileReadPromises = acceptedFiles.map(file =>
      new Promise((resolve, reject) => {
        const error = () => reject(`Reading of ${file.name} has failed.`);
        const reader = new window.FileReader();
        reader.readAsBinaryString(file);
        reader.onerror = error;
        reader.onload = () => {
          if (!reader.result) {
            error();
          }
          const json = JSON.parse(reader.result!.toString());
          if (json.constructor === Array) {
            reject(`Language file: ${file.name} has wrong format. Please export JSON *KEY-VALUE* instead.`);
          }
          const langName = file.name.match(LANG_REGEXP);
          if (langName) {
            const langCode = POEDITOR_LANG_CODE[langName[0]];
            if (!newGlossary.translations) {
              newGlossary.translations = {};
            }
            newGlossary.translations[langCode] = json;
            resolve();
          } else {
            reject(
              `Language not detected in a filename: ${file.name}. ` +
              "Please ensure that the filename hasn't been changed after exporting from POEditor."
            );
          }
        };
      })
    );
    return Promise.all(fileReadPromises)
      .then(() => {
        const { onGlossaryUpdate } = this.props;
        onGlossaryUpdate(newGlossary);
      })
      .catch((e) => {
        alert(e);
      });
  }

  private removeTranslation = (langCode: string) => {
    const { glossary, onGlossaryUpdate } = this.props;
    if (!glossary.translations) {
      return;
    }
    const newGlossary = clone(glossary);
    delete newGlossary.translations![langCode];
    onGlossaryUpdate(newGlossary);
  }

  private exportPOEditorJSON = () => {
    const { glossary } = this.props;
    const terms = glossaryToPOEditorTerms(glossary);
    const blob = new Blob([JSON.stringify(terms, null, 2)], { type: "application/json;charset=utf-8" });
    saveAs(blob, "terms.json", { autoBom: true });
  }
}
