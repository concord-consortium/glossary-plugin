import * as React from "react";
import { IClassInfo, IStudentSettings, IStudent, IGlossary } from "../../types";
import { watchClassSettings, saveStudentSettings } from "../../db";
import { POEDITOR_LANG_NAME } from "../../utils/poeditor-language-list";
import Button from "./button";
import * as Modal from "react-modal";

import * as css from "./language-selector.scss";

interface IProps {
  classInfo: IClassInfo;
  supportedLanguageCodes: string[];
  disableAria?: boolean;
  enableRecording: boolean;
}
interface IState {
  studentSettings: IStudentSettings[];
  modalIsOpen: boolean;
}

const NONE = "none";
const langName = (langCode: string) => POEDITOR_LANG_NAME[langCode] || langCode;

// 2019-11-19 NP: used to be '#app', but was failing under jest tests.
Modal.setAppElement("body");

export default class LanguageSelector extends React.Component<IProps, IState> {
  public state: IState = {
    studentSettings: [],
    modalIsOpen: false
  };

  public componentDidMount() {
    const { classInfo } = this.props;
    watchClassSettings(classInfo.source, classInfo.contextId, this.onSettingsUpdate);
  }

  public render() {
    const { modalIsOpen } = this.state;
    const { classInfo, supportedLanguageCodes, disableAria, enableRecording } = this.props;
    const { students } = classInfo;
    const languages = supportedLanguageCodes.concat(NONE).filter(s => s !== "en");
    return (
      <div className={css.langSelector}>
        <Button onClick={this.toggleModal} data-cy="setTranslations" className={css.modalToggle}>
          {enableRecording
            ? "Enable Recording & Set Translations"
            : "Set Translations"
          }
        </Button>
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={this.toggleModal}
          contentLabel="Set Translations"
        >
          <div className={css.modalContent}>
            <Button onClick={this.toggleModal} className={css.closeModal}>Close</Button>
            <div className={css.modalHeader}>
              {enableRecording
                ? "Enable Recording & Set Translations per Student"
                : "Set Translations per Student"
              }
            </div>
            <table data-cy="langTable" className={css.langTable}>
              <tbody>
                {enableRecording ?
                  <tr>
                    <th />
                    <th />
                    <th colSpan={languages.length} style={{textAlign: "center"}}>Set Translation</th>
                  </tr>
                  : undefined}
                <tr>
                  <th />
                  {enableRecording ? <th>Enable Recording</th> : undefined}
                  {languages.map(lang =>
                    <th key={lang} data-cy={`language-${lang}`} className={css.langName}>
                      {langName(lang)}
                    </th>)}
                </tr>
                {
                  students.map((s: IStudent) =>
                    <tr key={s.id}>
                      <th>{s.name}</th>
                      {enableRecording ?
                        <td>
                          <input
                            type="checkbox"
                            onChange={this.handleEnableRecordingChange(s)}
                            checked={this.getStudentSettings(s).enableRecording}
                          />
                        </td>
                        : undefined
                      }
                      {
                        languages.map(lang =>
                          <td key={lang}>
                            <input
                              type="radio"
                              value={lang}
                              onChange={this.handleLangChange(s)}
                              checked={this.getStudentSettings(s).preferredLanguage === lang}
                            />
                          </td>
                        )
                      }
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </Modal>
      </div>
    );
  }

  private toggleModal = () => {
    this.setState({ modalIsOpen: !this.state.modalIsOpen });
  }

  private getStudentSettings = (student: IStudent) => {
    const { studentSettings } = this.state;
    return studentSettings.find(s => s.userId === student.id) || {preferredLanguage: NONE, enableRecording: false};
  }

  private onSettingsUpdate = (studentSettings: IStudentSettings[]) => {
    this.setState({ studentSettings });
  }

  private handleSaveStudentSetting = (student: IStudent, setting: "preferredLanguage" | "enableRecording") => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const { classInfo } = this.props;
      const studentSettings = this.getStudentSettings(student);
      const newSettings: IStudentSettings = {
        userId: student.id,
        preferredLanguage: setting === "preferredLanguage" ? e.target.value : studentSettings.preferredLanguage,
        enableRecording: setting === "enableRecording" ? e.target.checked : studentSettings.enableRecording,
      };
      saveStudentSettings(classInfo.source, classInfo.contextId, newSettings);
    };
  }

  private handleLangChange = (student: IStudent) => {
    return this.handleSaveStudentSetting(student, "preferredLanguage");
  }

  private handleEnableRecordingChange = (student: IStudent) => {
    return this.handleSaveStudentSetting(student, "enableRecording");
  }
}
