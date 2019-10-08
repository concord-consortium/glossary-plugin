import * as React from "react";
import { IClassInfo, IStudentSettings, IStudent } from "../../types";
import { watchClassSettings, saveStudentSettings } from "../../db";
import { SUPPORTED_LANGUAGES } from "../../i18n-context";
import { POEDITOR_LANG_NAME } from "../../utils/poeditor-language-list";
import Button from "./button";
import * as Modal from "react-modal";

import * as css from "./language-selector.scss";

interface IProps {
  classInfo: IClassInfo;
}
interface IState {
  studentSettings: IStudentSettings[];
  modalIsOpen: boolean;
}

const NONE = "none";
const LANG_LIST = SUPPORTED_LANGUAGES.concat(NONE).filter(s => s !== "en");
const langName = (langCode: string) => POEDITOR_LANG_NAME[langCode] || langCode;

// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement("#app");

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
    const { classInfo } = this.props;
    const { students } = classInfo;
    return (
      <div className={css.langSelector}>
        <Button onClick={this.toggleModal} className={css.modalToggle}>
          Set Translations
        </Button>
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={this.toggleModal}
          contentLabel="Set Translations"
        >
          <Button onClick={this.toggleModal} className={css.closeModal}>Close</Button>
          <div className={css.modalHeader}>Set Translations per Student</div>
          <table className={css.langTable}>
            <tbody>
              <tr>
                <th />
                {LANG_LIST.map(lang => <th key={lang} className={css.langName}>{langName(lang)}</th>)}
              </tr>
              {
                students.map((s: IStudent) =>
                  <tr key={s.id}>
                    <th>{s.name}</th>
                    {
                      LANG_LIST.map(lang =>
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
