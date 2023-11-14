import * as React from "react";
import { IClassInfo } from "../../types";
import LanguageSelector from "./language-selector";
import {getHashParam, GLOSSARY_URL_PARAM} from "../../utils/get-url-param";
import StatsTableContainer from "./stats-table-container";
import { SUPPORTED_LANGUAGES, fetchGlossary, IFetchGlossaryCallbackOptions } from "../../i18n-context";

import * as ccLogoSrc from "../../images/cc-logo.png";
import * as css from "./dashboard-app.scss";

interface IProps {
  classInfo: IClassInfo;
  resourceUrl: string;
}

interface IState {
  supportedLanguageCodes: string[]
}

export default class DashboardApp extends React.Component<IProps, IState> {
  public state: IState = {
    supportedLanguageCodes: SUPPORTED_LANGUAGES
  };

  public componentDidMount() {
    this.loadGlossary();
  }

  public render() {
    const { classInfo, resourceUrl } = this.props;
    const { supportedLanguageCodes } = this.state;
    return (
      <div className={css.dashboardApp}>
        <div className={css.header}>
          <img src={ccLogoSrc} alt="CC logo" />
        </div>
        <div className={css.content}>
          <LanguageSelector
            classInfo={classInfo}
            supportedLanguageCodes={supportedLanguageCodes}
          />
          <StatsTableContainer classInfo={classInfo} resourceUrl={resourceUrl} />
        </div>
      </div>
    );
  }

  // 2019-11-18 NP: If we have a URL Parameter named "glossaryUrl"
  // we look to see which languages are defined within. Otherwise,
  // we use the full list of SUPPORTED_LANGUAGES.  We also look
  // to see if recording is enabled for this glossary.
  private loadGlossary = () => {
    const glossaryUrl = getHashParam(GLOSSARY_URL_PARAM);
    const callback = (options: IFetchGlossaryCallbackOptions) => {
      const {languageCodes} = options;
      this.setState({supportedLanguageCodes: languageCodes});
    };
    fetchGlossary(glossaryUrl, callback);
  };
}
