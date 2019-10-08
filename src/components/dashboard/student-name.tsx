import * as React from "react";
import { IStudent } from "../../types";

import * as css from "./student-name.scss";

interface IProps {
  student: IStudent;
  studentExpanded: boolean;
  expanded: boolean;
  setStudentExpanded: (studentId: string, val: boolean) => void;
}

export default class StudentName extends React.Component<IProps, {}> {
  public render() {
    const { student, expanded } = this.props;
    return (
      <div
        className={css.studentName + " " + (expanded ? css.expanded : "")}
        onClick={this.onStudentNameClick}
        data-cy="studentName"
      >
        <div className={css.content}>
          {student.name}
        </div>
      </div>
    );
  }

  private onStudentNameClick = () => {
    const { student, studentExpanded, setStudentExpanded  } = this.props;
    setStudentExpanded(student.id, !studentExpanded);
  }
}
