import * as React from "react";
import {  IStudent } from "../../types";
import { IUsageStats, ISupportsDef } from "../../utils/get-usage-stats";

import * as css from "./stats-table.scss";

interface IProps {
  students: IStudent[];
  stats: IUsageStats;
}
interface IState {
  columnExpanded: {};
}

const Definitions = ({ definitions }: {definitions: string[]}) => (
  <div>
    {definitions.map((d, idx) => <p key={idx}>{d}</p>)}
  </div>
);

const Supports = ({ supports }: {supports: ISupportsDef}) => (
  <div>
    <p>Text to speech: {supports.textToSpeech && "✓"}</p>
    {supports.imageShown !== undefined && <p>Image: {supports.imageShown && "✓"}</p>}
    {supports.videoShown !== undefined && <p>Video: {supports.videoShown && "✓"}</p>}
  </div>
);

export default class StatsTable extends React.Component<IProps, IState> {
  public state: IState = {
    columnExpanded: {}
  };

  public render() {
    const { students, stats } = this.props;
    const terms = Object.keys(stats[students[0].id]);
    return (
      <div>
        Statistics
        <table className={css.stats}>
          <tbody>
          <tr>
            <th/>
            {terms.map(t => <th key={t} colSpan={3}>{t}</th>)}
          </tr>
          <tr>
            <th/>
            {terms.map(t => [
              <th key={t + "c"}>Clicked</th>,
              <th key={t + "def"}>Defined</th>,
              <th key={t + "sup"}>Supports</th>
            ])}
          </tr>
          {
            students.map((s: IStudent) =>
              <tr key={s.id}>
                <th>{s.name}</th>
                {
                  terms.map(t => [
                    <td key={t + "c"}>{stats[s.id][t].clicked && "✓"}</td>,
                    <td key={t + "def"}><Definitions definitions={stats[s.id][t].definitions} /></td>,
                    <td key={t + "sup"}><Supports supports={stats[s.id][t].supports} /></td>
                  ])
                }
              </tr>
            )
          }
          </tbody>
        </table>
      </div>
    );
  }
}
