import * as React from "react";
import { IClassInfo } from "../../types";
import LanguageSelector from "./language-selector";
import StatsTableContainer from "./stats-table-container";

interface IProps {
  classInfo: IClassInfo;
  resourceUrl: string;
}

export default class DashboardApp extends React.Component<IProps, {}> {
  public render() {
    const { classInfo, resourceUrl } = this.props;
    return (
      <div>
        <LanguageSelector classInfo={classInfo} />
        <br/>
        <StatsTableContainer classInfo={classInfo} resourceUrl={resourceUrl} />
      </div>
    );
  }
}
