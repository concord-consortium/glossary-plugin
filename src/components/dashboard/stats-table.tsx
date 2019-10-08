import * as React from "react";
import TermName from "./term-name";
import StudentName from "./student-name";
import TermInteractions from "./term-interactions";
import TermValues from "./term-values";
import { IStudent, ExpandableInteraction } from "../../types";
import { IUsageStats, INTERACTIONS, getProgress } from "../../utils/usage-stats-helpers";
import ExpandStudents from "./expand-students";

import * as css from "./stats-table.scss";

export const BOTTOM_MARGIN = 10; // px
export const COLLAPSED_TERM_WIDTH = 330; // px
export const COLLAPSED_VALUE_WIDTH = 110; // px
export const FULL_VALUE_WIDTH = 300; // px

interface IProps {
  students: IStudent[];
  stats: IUsageStats;
}

export const EXPANDABLE_INTERACTIONS = INTERACTIONS
  .filter(i => i.expandable)
  .map(i => i.name) as [ExpandableInteraction, ExpandableInteraction];

interface IExpandedInteractions {
  [term: string]: {
    definitions?: boolean;
    supports?: boolean;
  };
}

interface IState {
  expandedTerms: {[term: string]: boolean};
  expandedInteractions: IExpandedInteractions;
  expandedStudents: {[studentId: string]: boolean};
}

export default class StatsTable extends React.Component<IProps, IState> {
  public state = {
    expandedTerms: {} as {[term: string]: boolean},
    expandedInteractions: {} as IExpandedInteractions,
    expandedStudents: {} as {[studentId: string]: boolean}
  };

  private mainContainer = React.createRef<HTMLDivElement>();
  private horizontalScrollingContainer = React.createRef<HTMLDivElement>();
  private termHeaders = React.createRef<HTMLDivElement>();

  public componentDidMount() {
    // Make sure that the verticalScrollContainer fits the window height.
    window.addEventListener("resize", this.onResize);
    // Synchronize scrolling of headers and horizontalScrollContainer.
    this.horizontalScrollingContainer.current!.addEventListener("scroll", this.onHorizontalContainerScroll);
    this.termHeaders.current!.addEventListener("scroll", this.onHeadersScroll);
    this.onResize();
  }

  public componentWillUnmount() {
    window.removeEventListener("resize", this.onResize);
    this.horizontalScrollingContainer.current!.removeEventListener("scroll", this.onHorizontalContainerScroll);
    this.termHeaders.current!.removeEventListener("scroll", this.onHeadersScroll);
  }

  public render() {
    const { students, stats } = this.props;
    const { expandedTerms, expandedStudents, expandedInteractions } = this.state;

    const anyStudentExpanded = this.anyStudentExpanded();
    const anyInteractionExpanded = this.anyInteractionExpanded();
    const showTallInteractionHeader = anyStudentExpanded || anyInteractionExpanded;

    const terms = this.getTerms();
    return (
      <div ref={this.mainContainer} className={css.dashboard}>
        <div className={css.innerContainer}>
          <div className={css.headers}>
            <ExpandStudents
              students={students}
              anyStudentExpanded={anyStudentExpanded}
              setStudentsExpanded={this.setStudentsExpanded}
            />
            <div ref={this.termHeaders} className={css.termHeaders}>
              <div>
                {
                  terms.map(t =>
                    <TermName
                      key={t}
                      term={t}
                      width={this.getTermColumnWidth(t)}
                      expanded={expandedTerms[t]}
                      setTermExpanded={this.setTermExpanded}
                    />
                  )
                }
              </div>
              <div className={css.interactionPromptsRow + " " + (showTallInteractionHeader ? css.fullPrompts : "")}>
                {
                  terms.map(t =>
                    <TermInteractions
                      key={t}
                      term={t}
                      width={this.getTermColumnWidth(t)}
                      expanded={expandedTerms[t]}
                      showFullPrompts={anyStudentExpanded}
                      setInteractionExpanded={this.setInteractionExpanded}
                      expandedInteractions={expandedInteractions[t] || {}}
                    />
                  )
                }
              </div>
            </div>
          </div>
          <div className={css.verticalScrollContainer}>
            <div className={css.studentNames}>
              {
                students.map(s => {
                  const studentExpanded = expandedStudents[s.id];
                  const expanded = anyInteractionExpanded || studentExpanded;
                  return (
                    <StudentName
                      key={s.id}
                      student={s}
                      studentExpanded={studentExpanded}
                      expanded={expanded}
                      setStudentExpanded={this.setStudentExpanded}
                    />
                  );
                })
              }
            </div>
            <div ref={this.horizontalScrollingContainer} className={css.horizontalScrollContainer}>
              {
                students.map(s => {
                  const expandedStudent = expandedStudents[s.id];
                  const expanded = anyInteractionExpanded || expandedStudent;
                  return (
                    <div
                      key={s.id}
                      className={css.studentAnswersRow + " " + (expanded ? css.fullAnswers : "")}
                      data-cy="studentAnswersRow"
                    >
                      {
                        terms.map(t =>
                          <TermValues
                            key={t}
                            width={this.getTermColumnWidth(t)}
                            anyStudentExpanded={anyStudentExpanded}
                            expanded={expandedTerms[t]}
                            showFullValues={expandedStudent}
                            progress={getProgress(stats[s.id][t])}
                            expandedInteractions={expandedInteractions[t] || {}}
                            stats={stats[s.id][t]}
                          />,
                        )
                      }
                    </div>
                  );
                })
              }
            </div>
          </div>
        </div>
      </div>
    );
  }

  private getTerms() {
    const { stats, students } = this.props;
    return Object.keys(stats[students[0].id]);
  }

  private anyTermExpanded() {
    const { expandedTerms } = this.state;
    const values = Object.keys(expandedTerms).map(k => expandedTerms[k]);
    return !!values.find(v => v);
  }

  private anyStudentExpanded() {
    const { expandedStudents } = this.state;
    const values = Object.keys(expandedStudents).map(k => expandedStudents[k]);
    return !!values.find(v => v);
  }

  private anyInteractionExpanded() {
    const terms = this.getTerms();
    const { expandedInteractions } = this.state;
    let anyExpanded = false;
    terms.forEach(t => {
      EXPANDABLE_INTERACTIONS.forEach(ei => {
        if (expandedInteractions[t] && expandedInteractions[t][ei]) {
          anyExpanded = true;
        }
      });
    });
    return anyExpanded;
  }

  private setTermExpanded = (term: string, val: boolean) => {
    const expandedTerms = Object.assign({}, this.state.expandedTerms, {[term]: val});
    if (!val) {
      const expandedInteractions = Object.assign({}, this.state.expandedInteractions);
      expandedInteractions[term] = {};
      this.setState({ expandedInteractions });
    }
    this.setState({ expandedTerms }, () => {
      // When user collapses term, check if anything else is expanded.
      // If not, collapse all the student rows too.
      if (!val && !this.anyTermExpanded()) {
        this.setStudentsExpanded(false);
      }
    });
  }

  private setStudentExpanded = (studentId: string, val: boolean) => {
    const expandedStudents = Object.assign({}, this.state.expandedStudents, {[studentId]: val});
    this.setState({ expandedStudents }, () => {
      // When user expands student row, check if there's at least one expanded term.
      // If not, expand the fist one.
      if (val && !this.anyTermExpanded()) {
        this.setTermExpanded(this.getTerms()[0], true);
      }
    });
  }

  private setStudentsExpanded = (val: boolean) => {
    const { students } = this.props;
    const expandedStudents: {[studentId: string]: boolean} = {};
    students.forEach(s => { expandedStudents[s.id] = val; });
    this.setState({ expandedStudents }, () => {
      // When user expands student row, check if there's at least one expanded term.
      // If not, expand the fist one.
      if (val && !this.anyTermExpanded()) {
        this.setTermExpanded(this.getTerms()[0], true);
      }
    });
  }

  private setInteractionExpanded = (term: string, interaction: ExpandableInteraction, val: boolean) => {
    const newInt = Object.assign({}, this.state.expandedInteractions[term], {[interaction]: val});
    const expandedInteractions = Object.assign({}, this.state.expandedInteractions);
    expandedInteractions[term] = newInt;
    this.setState({ expandedInteractions });
  }

  private onResize = () => {
    // Make sure that the verticalScrollContainer fits the window height.
    const bb = this.mainContainer.current!.getBoundingClientRect() as DOMRect;
    this.mainContainer.current!.style.height = (window.innerHeight - bb.y - BOTTOM_MARGIN) + "px";
  }

  private onHorizontalContainerScroll = () => {
    // Synchronize scrolling of headers and horizontalScrollContainer.
    // Make sure there's no loop of scroll events. It causes weird effects and containers end up out of sync.
    this.ignoreNextScrollEvent(this.termHeaders.current!, this.onHeadersScroll);
    this.termHeaders.current!.scrollLeft = this.horizontalScrollingContainer.current!.scrollLeft;
  }

  private onHeadersScroll = () => {
    // Synchronize scrolling of headers and horizontalScrollContainer.
    // Make sure there's no loop of scroll events. It causes weird effects and containers end up out of sync.
    this.ignoreNextScrollEvent(this.horizontalScrollingContainer.current!, this.onHorizontalContainerScroll);
    this.horizontalScrollingContainer.current!.scrollLeft = this.termHeaders.current!.scrollLeft;
  }

  private ignoreNextScrollEvent(element: HTMLElement, originalHandler: any) {
    // Temporarily replace scroll handler and restore it after it's triggered once.
    const temporaryHandler = () => {
      element.removeEventListener("scroll", temporaryHandler);
      element.addEventListener("scroll", originalHandler);
    };
    element.removeEventListener("scroll", originalHandler);
    element.addEventListener("scroll", temporaryHandler);
  }

  private getNumberOfExpandedInteractions(term: string) {
    const { expandedInteractions, expandedStudents } = this.state;
    if (Object.keys(expandedStudents).find(s => expandedStudents[s])) {
      // if any student is expanded, then all the columns are expanded.
      return EXPANDABLE_INTERACTIONS.length; // definitions + supports
    }
    let count = 0;
    EXPANDABLE_INTERACTIONS.forEach(i => {
      if (expandedInteractions[term] && expandedInteractions[term][i]) {
        count += 1;
      }
    });
    return count;
  }

  private getTermColumnWidth(term: string) {
    const { expandedTerms } = this.state;
    if (expandedTerms[term]) {
      const numberOfExpandedInteractions = this.getNumberOfExpandedInteractions(term);
      const numberOfClosedInteractions = EXPANDABLE_INTERACTIONS.length - numberOfExpandedInteractions;
      const width = numberOfClosedInteractions * COLLAPSED_VALUE_WIDTH +
        numberOfExpandedInteractions * FULL_VALUE_WIDTH;
      return Math.max(COLLAPSED_TERM_WIDTH, width) + "px";
    }
    return COLLAPSED_TERM_WIDTH + "px";
  }
}
