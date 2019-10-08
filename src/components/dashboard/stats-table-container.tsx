import * as React from "react";
import { IClassInfo } from "../../types";
import { watchClassEvents } from "../../db";
import { ILogEvent } from "../../types";
import StatsTable from "./stats-table";
import { usageStatsHelpers, IUsageStats } from "../../utils/usage-stats-helpers";

interface IProps {
  classInfo: IClassInfo;
  resourceUrl: string;
}
interface IState {
  notStarted: boolean;
  stats: IUsageStats | null;
}

export default class StatsTableContainer extends React.Component<IProps, IState> {
  public state: IState = {
    notStarted: false,
    stats: null
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
          <StatsTable students={classInfo.students} stats={stats} />
        }
      </div>
    );
  }

  private onEventsUpdate = async (events: ILogEvent[]) => {
    const { classInfo } = this.props;
    const stats = await usageStatsHelpers(classInfo.students, events);
    this.setState({ notStarted: events.length === 0, stats });
  }
}
