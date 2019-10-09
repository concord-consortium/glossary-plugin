import * as React from "react";
import { IClassInfo } from "../../types";
import LanguageSelector from "./language-selector";
import StatsTableContainer from "./stats-table-container";

import * as ccLogoSrc from "../../images/cc-logo.png";
import * as css from "./dashboard-app.scss";

interface IProps {
  classInfo: IClassInfo;
  resourceUrl: string;
}

export default class DashboardApp extends React.Component<IProps, {}> {
  public render() {
    const { classInfo, resourceUrl } = this.props;
    return (
      <div className={css.dashboardApp}>
        <div className={css.header}>
          <img src={ccLogoSrc} alt="CC logo" />
        </div>
        <div className={css.content}>
          <LanguageSelector classInfo={classInfo} />
          <StatsTableContainer classInfo={classInfo} resourceUrl={resourceUrl} />
        </div>
      </div>
    );
  }
}
