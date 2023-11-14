import * as React from "react";

import { ISaveIndicatorStatus } from "../../hooks/use-save";

import * as css from "./save-indicator.scss";

interface IProps {
  status: ISaveIndicatorStatus | null;
}

const SaveIndicator = ({status}: IProps) => {
  if (!status) {
    return null;
  }

  return (
    <div className={css.saveIndicator}>
      {status && status.mode === "saving" && <div className={css.saving}>Saving...</div>}
      {status && status.mode === "saved" && <div className={css.saved}>Saved!</div>}
      {status && status.mode === "error" && <div className={css.error}>{status.message}</div>}
      {status && status.mode === "savingDisabled" && <div className={css.saving}>Saving is disabled!</div>}
    </div>
  );
};

export default SaveIndicator;
