import * as React from "react";
import Button from "./button";
import { IStudent } from "../../types";

import * as css from "./expand-students.scss";

interface IProps {
  students: IStudent[];
  anyStudentExpanded: boolean;
  setStudentsExpanded: (val: boolean) => void;
}

export default class ExpandStudents extends React.Component<IProps, {}> {
  public render() {
    const { anyStudentExpanded } = this.props;
    return (
      <div className={css.expandStudents}>
        <div className={css.title} />
        <div className={css.buttonCell}>
          <Button onClick={this.handleClick} className={css.button}>
            {anyStudentExpanded ? "Close Students" : "Open Students"}
          </Button>
        </div>
      </div>
    );
  }

  private handleClick = () => {
    const { setStudentsExpanded, anyStudentExpanded } = this.props;
    setStudentsExpanded(!anyStudentExpanded);
  };
}
