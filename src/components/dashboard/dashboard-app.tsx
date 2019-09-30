import * as React from "react";
import { IClassInfo } from "../../types";
import LanguageSelector from "./language-selector";

interface IProps {
  classInfo: IClassInfo;
}

export default class DashboardApp extends React.Component<IProps, {}> {
  public render() {
    const { classInfo } = this.props;
    return (
      <div>
        <LanguageSelector classInfo={classInfo} />
      </div>
    );
  }
}
