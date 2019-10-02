import * as React from "react";
import { ILogEventPartial } from "./utils/logging-utils";

export const defaultLog = (event: ILogEventPartial) => { /* noop */ };
export const loggingContext = React.createContext({ log: defaultLog });
