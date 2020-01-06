import * as React from "react";
import { ILogEventPartial } from "./types";

export const defaultLog = (event: ILogEventPartial) => {
  if (window.location.search.indexOf("DEBUG_LOG") !== -1) {
    // tslint:disable-next-line:no-console
    console.log("LOGGER", event);
  }
};
export const loggingContext = React.createContext({ log: defaultLog });
