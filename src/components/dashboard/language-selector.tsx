import * as React from "react";
import { IClassInfo, IStudentSettings, IStudent } from "../../types";
import { watchClassSettings, saveStudentSettings } from "../../db";
import { SUPPORTED_LANGUAGES } from "../../i18n-context";
import { POEDITOR_LANG_NAME } from "../../utils/poeditor-language-list";

interface IProps {
  classInfo: IClassInfo;
}
interface IState {
  studentSettings: IStudentSettings[];
}

const NONE = "none";
const LANG_LIST = SUPPORTED_LANGUAGES.concat(NONE).filter(s => s !== "en");
const langName = (langCode: string) => POEDITOR_LANG_NAME[langCode] || langCode;

export default class LanguageSelector extends React.Component<IProps, IState> {
  public state: IState = {
    studentSettings: []
  };

  public componentDidMount() {
    const { classInfo } = this.props;
    watchClassSettings(classInfo.source, classInfo.contextId, this.onSettingsUpdate);
  }

  public render() {
    const { classInfo } = this.props;
    const { students } = classInfo;
    return (
      <div>
        Set Translations per Student
        <table>
          <tbody>
            <tr>
              <th />
              {LANG_LIST.map(lang => <th key={lang}>{langName(lang)}</th>)}
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

      </div>
    );
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
