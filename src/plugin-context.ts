import * as React from "react";
import { defaultLog } from "./logging-context";
import { DEFAULT_LANG, defaultTranslate } from "./i18n-context";

// Combined i18n and logging context, so it can be consumed by child components easier (e.g. using new API).
export const pluginContext = React.createContext({
  lang: DEFAULT_LANG,
  translate: defaultTranslate,
  log: defaultLog
});
