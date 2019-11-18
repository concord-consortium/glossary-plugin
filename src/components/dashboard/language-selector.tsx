import * as React from "react";
import { IClassInfo, IStudentSettings, IStudent, IGlossary } from "../../types";
import { watchClassSettings, saveStudentSettings } from "../../db";
import { getHashParam, GLOSSARY_URL_PARAM} from "../../utils/get-url-param";
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
  supportedLanguageCodes: string[];
}

const NONE = "none";
const langName = (langCode: string) => POEDITOR_LANG_NAME[langCode] || langCode;

// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement("#app");

export default class LanguageSelector extends React.Component<IProps, IState> {
  public state: IState = {
    studentSettings: [],
    modalIsOpen: false,
    supportedLanguageCodes: []
  };

  public componentDidMount() {
    const { classInfo } = this.props;
    watchClassSettings(classInfo.source, classInfo.contextId, this.onSettingsUpdate);
    this.loadGlossaryLanguages();
  }

  public render() {
    const { modalIsOpen } = this.state;
    const { classInfo } = this.props;
    const { students } = classInfo;
    const { supportedLanguageCodes } = this.state;
    const languages = supportedLanguageCodes.concat(NONE).filter(s => s !== "en");
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
          <div className={css.modalContent}>
          <Button onClick={this.toggleModal} className={css.closeModal}>Close</Button>
          <div className={css.modalHeader}>Set Translations per Student</div>
            <table className={css.langTable}>
              <tbody>
                <tr>
                  <th />
                  {languages.map(lang => <th key={lang} className={css.langName}>{langName(lang)}</th>)}
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

  // 2019-11-18 NP: If we have a URL Parameter named "glossaryUrl"
  // we look to see which languages are defined within. Otherwise,
  // we use the full list of SUPPORTED_LANGUAGES.
  private loadGlossaryLanguages = () => {
    const glossaryUrl = getHashParam(GLOSSARY_URL_PARAM);
    const setLangs = (glossary: IGlossary) => {
      const {translations} = glossary;
      if (translations && Object.keys(translations).length > 0){
        this.setState({
          supportedLanguageCodes: Object.keys(translations)
        });
      }
    };

    if (glossaryUrl) {
      fetch(glossaryUrl)
      .then( (response: Response) => {
        response.json().then(setLangs);
      });
    } else {
      // TBD: Should we display all languages or no languages if we can't
      // find any in the URL Params?
      this.setState({
        supportedLanguageCodes: SUPPORTED_LANGUAGES // []
      });
    }
  }
}
