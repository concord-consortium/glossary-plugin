import * as React from "react";
import { IClassInfo } from "../../types";
import { watchClassEvents } from "../../db";
import { ILogEvent } from "../../types";
import StatsTable from "./stats-table";
import TermsFilter from "./terms-filter";
import { getUsageStats, IUsageStats } from "../../utils/usage-stats-helpers";

interface IProps {
  classInfo: IClassInfo;
  resourceUrl: string;
}
interface IState {
  notStarted: boolean;
  stats: IUsageStats | null;
  termsFilter: string;
  events: ILogEvent[];
}

export default class StatsTableContainer extends React.Component<IProps, IState> {
  public state: IState = {
    notStarted: false,
    stats: null,
    termsFilter: "",
    events: []
  };

  public componentDidMount() {
    const { classInfo, resourceUrl } = this.props;
    watchClassEvents(classInfo.source, classInfo.contextId, resourceUrl, this.onEventsUpdate);
  }

  public render() {
    const { classInfo } = this.props;
    const { stats, notStarted } = this.state;
    return (
      <div>
        {
          stats === null ?
          (
            notStarted ?
            <div>Statistics not available, no student has run the activity yet.</div> :
            <div>Loading...</div>
          ) :
            <div>
              <TermsFilter onTermsFilterUpdate={this.onTermsFilterUpdate} />
              <StatsTable students={classInfo.students} stats={stats}  />
            </div>
        }
      </div>
    );
  }

  private updateStats = async () => {
    const { classInfo } = this.props;
    const { termsFilter, events } = this.state;
    const processedFilters = termsFilter.split(",").filter(t => t !== "").map(t => t.trim());
    const stats = await getUsageStats(classInfo.students, events, processedFilters);
    this.setState({ notStarted: events.length === 0, stats });
  }

  private onEventsUpdate = async (events: ILogEvent[]) => {
    this.setState({ events }, this.updateStats);
  }

  private onTermsFilterUpdate = (termsFilter: string) => {
    this.setState({ termsFilter }, this.updateStats);
  }
}
