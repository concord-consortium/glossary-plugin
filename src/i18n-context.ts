import * as React from "react";

const context: {
  translate: (key: string, fallback: string | null) => string | null;
} = {
  translate: (key: string, fallback = null) => fallback
};
export const i18nContext = React.createContext(context);
