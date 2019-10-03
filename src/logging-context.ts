import * as React from "react";
import { ILogEventPartial } from "./types";

export const defaultLog = (event: ILogEventPartial) => { /* noop */ };
export const loggingContext = React.createContext({ log: defaultLog });
