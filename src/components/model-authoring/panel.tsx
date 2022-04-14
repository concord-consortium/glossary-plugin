import * as React from "react";
import { useState } from "react";

import * as css from "./panel.scss";

interface IProps {
  contentClassName: string;
  label: string;
  collapsible: boolean;
  minHeight: number;
  children: JSX.Element | JSX.Element[]
}

export const Panel = ({ contentClassName, label, collapsible, minHeight, children }: IProps) => {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  const handleToggleCollapse = () => setCollapsed(prev => !prev);

  return (
    <div className={css.panel}>
      <div className={css.header}>
        <h1>{label}</h1>
        {collapsible && <button onClick={handleToggleCollapse}>{collapsed ? "˅" : "˄"}</button>}  {/* using text for now but it looks like we need an icon asset  */}
      </div>
      {!collapsed && <div className={`${css.content} ${contentClassName}`} style={{minHeight}}>{children}</div>}
    </div>
  )
}