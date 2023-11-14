import * as React from "react";
import { useState } from "react";

import * as css from "./panel.scss";
import * as icons from "../common/icons.scss";

interface IProps {
  label: string;
  collapsible: boolean;
  children: any
  headerControls?: React.ReactElement | React.ReactElement[]
}

export const Panel = ({ label, collapsible, headerControls, children }: IProps) => {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  const handleToggleCollapse = () => setCollapsed(prev => !prev);

  return (
    <div className={css.panel}>
      <div className={css.header}>
        <h1>{label}</h1>
        <div>
          {headerControls}
          {collapsible &&
          <button className={css.toggle} onClick={handleToggleCollapse}>
            {collapsed ?
            <span className={icons.iconCaretDown} /> :
            <span className={icons.iconCaretUp} />}
          </button>
          }
        </div>
      </div>
      {!collapsed && <div className={css.content}>{children}</div>}
    </div>
  );
};
