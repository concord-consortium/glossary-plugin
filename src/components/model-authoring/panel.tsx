import * as React from "react";
import { useState } from "react";

import * as css from "./panel.scss";

interface IProps {
  label: string;
  collapsible: boolean;
  children: any
}

export const Panel = ({ label, collapsible, children }: IProps) => {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  const handleToggleCollapse = () => setCollapsed(prev => !prev);

  return (
    <div className={css.panel}>
      <div className={css.header}>
        <h1>{label}</h1>
        {collapsible && <button onClick={handleToggleCollapse}>{collapsed ? "˅" : "˄"}</button>}  {/* using text for now but it looks like we need an icon asset  */}
      </div>
      {!collapsed && <div className={css.content}>{children}</div>}
    </div>
  )
}