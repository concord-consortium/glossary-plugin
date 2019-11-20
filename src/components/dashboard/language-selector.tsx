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
    const { classInfo, supportedLanguageCodes, disableAria } = this.props;
    const { students } = classInfo;
    const languages = supportedLanguageCodes.concat(NONE).filter(s => s !== "en");
    return (
      <div className={css.langSelector}>
        <Button onClick={this.toggleModal} data-cy="setTranslations" className={css.modalToggle}>
          Set Translations
        </Button>
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={this.toggleModal}
          contentLabel="Set Translations"
        >
          <div className={css.modalContent}>
          <Button onClick={this.toggleModal} className={css.closeModal}>Close</Button>
          <div className={css.modalHeader}>Set Translations per Student</div>
            <table data-cy="langTable" className={css.langTable}>
              <tbody>
                <tr>
                  <th />
                  {languages.map(lang =>
                    <th key={lang} data-cy={`language-${lang}`} className={css.langName}>
                      {langName(lang)}
                    </th>)}
                </tr>
                {
                  students.map((s: IStudent) =>
                    <tr key={s.id}>
                      <th>{s.name}</th>
                      {
                        languages.map(lang =>
                          <td key={lang}>
                            <input
                              type="radio"
                              name={s.id}
                              value={lang}
                              onChange={this.handleLangChange}
                              checked={this.getLangForStudent(s) === lang}
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

  private getLangForStudent = (student: IStudent) => {
    const { studentSettings } = this.state;
    const settings = studentSettings.find(s => s.userId === student.id);
    if (!settings) {
      return NONE;
    }
    return settings.preferredLanguage;
  }

  private onSettingsUpdate = (studentSettings: IStudentSettings[]) => {
    this.setState({ studentSettings });
  }

  private handleLangChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { classInfo } = this.props;
    const userId = e.target.name;
    const preferredLanguage = e.target.value;
    saveStudentSettings(classInfo.source, classInfo.contextId, { userId, preferredLanguage });
  }

}
