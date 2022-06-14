import * as React from "react";
import { IClassInfo, IStudentSettings, IStudent } from "../../types";
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

const SCAFFOLDED_QUESTION_LEVELS = [5, 4, 3, 2, 1];
const SCAFFOLDED_LEVEL_MIN = SCAFFOLDED_QUESTION_LEVELS[SCAFFOLDED_QUESTION_LEVELS.length - 1];
const SCAFFOLDED_LEVEL_MAX = SCAFFOLDED_QUESTION_LEVELS[0];

// UI lists scaffolded question levels from the biggest to the smallest.
// This helper is useful to transform value of the slider.
export const scaffoldedLevelReversed = (lvl: number) => {
  return SCAFFOLDED_LEVEL_MAX - lvl + 1;
};

const NONE = "none";
const langName = (langCode: string) => POEDITOR_LANG_NAME[langCode] || langCode;

const DEF_STUDENT_SETTINGS: IStudentSettings = {
  userId: "",
  preferredLanguage: NONE,
  scaffoldedQuestionLevel: SCAFFOLDED_LEVEL_MIN
};

// 2019-11-19 NP: used to be '#app', but was failing under jest tests.
Modal.setAppElement("body");

type SettingName = "preferredLanguage" | "scaffoldedQuestionLevel";

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
    const { classInfo, supportedLanguageCodes } = this.props;
    const { students } = classInfo;
    const languages = supportedLanguageCodes.concat(NONE).filter(s => s !== "en");
    return (
      <div className={css.langSelector}>
        <Button onClick={this.toggleModal} data-cy="setTranslations" className={css.modalToggle}>
          Set Student Access
        </Button>
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={this.toggleModal}
          contentLabel="Set Student Access"
        >
          <div className={css.modalContent}>
            <Button onClick={this.toggleModal} className={css.closeModal}>Close</Button>
            <div className={css.modalHeader}>
              Student Access Settings
            </div>
            <table data-cy="langTable" className={css.langTable}>
              <tbody>
                <tr>
                  {/* First empty header is for student names */}
                  <th />
                  <th colSpan={languages.length} style={{textAlign: "center"}}>2nd Language</th>
                  <th colSpan={SCAFFOLDED_QUESTION_LEVELS.length} style={{textAlign: "center"}}>
                    Scaffolded Question Level
                  </th>
                </tr>
                <tr>
                  {/* First empty header is for student names */}
                  <th />
                  {
                    languages.map(lang =>
                      <th key={lang} data-cy={`language-${lang}`} className={css.langName}>
                        {langName(lang)}
                      </th>
                    )
                  }
                  {
                    SCAFFOLDED_QUESTION_LEVELS.map(lvl =>
                      <th key={lvl} data-cy={`scaffolded-question-level-${lvl}`} className={css.scaffoldedQuestionLvl}>
                        {lvl}
                      </th>
                    )
                  }
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
                              value={lang}
                              onChange={this.handleLangChange(s)}
                              checked={this.getStudentSettings(s).preferredLanguage === lang}
                            />
                          </td>
                        )
                      }
                      <td colSpan={SCAFFOLDED_QUESTION_LEVELS.length} className={css.scaffoldedQuestionLvlSlider}>
                        <input
                          type="range"
                          min={SCAFFOLDED_LEVEL_MIN}
                          max={SCAFFOLDED_LEVEL_MAX}
                          step={1}
                          onChange={this.handleScaffoldedQuestionLevelChange(s)}
                          // Note that steps are listed in reverse order: 5, 4, 3, 2, 1.
                          value={scaffoldedLevelReversed(this.getStudentSettings(s).scaffoldedQuestionLevel)}
                        />
                      </td>
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
    const existingSettings = studentSettings.find(s => s.userId === student.id);
    // This line will ensure that each time we add some new settings, a default value will be provided even to
    // previously saved settings.
    return Object.assign({}, DEF_STUDENT_SETTINGS, existingSettings, {userId: student.id});
  }

  private onSettingsUpdate = (studentSettings: IStudentSettings[]) => {
    this.setState({ studentSettings });
  }

  private handleSaveStudentSetting = (student: IStudent, setting: SettingName) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const { classInfo } = this.props;
      const studentSettings = this.getStudentSettings(student);
      const newSettings: IStudentSettings = {
        userId: student.id,
        preferredLanguage: setting === "preferredLanguage" ? e.target.value : studentSettings.preferredLanguage,
        scaffoldedQuestionLevel: setting === "scaffoldedQuestionLevel" ?
          // Note that steps are listed in reverse order: 5, 4, 3, 2, 1.
          scaffoldedLevelReversed(parseInt(e.target.value, 10)) : studentSettings.scaffoldedQuestionLevel
      };
      saveStudentSettings(classInfo.source, classInfo.contextId, newSettings);
    };
  }

  private handleLangChange = (student: IStudent) => {
    return this.handleSaveStudentSetting(student, "preferredLanguage");
  }

  private handleScaffoldedQuestionLevelChange = (student: IStudent) => {
    return this.handleSaveStudentSetting(student, "scaffoldedQuestionLevel");
  }
}
