import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import * as ReactDOM from "react-dom";

import { IGlossary, IGlossaryModelAuthoringInfo, IGlossaryModelAuthoringInitialData, IGlossarySettings, ITranslationMap, IWordDefinition } from "../../types";
import { GlossaryTermsDefinitions } from "./glossary-terms-definitions";
import { GlossarySettings } from "./glossary-settings";

import { useSave } from "../../hooks/use-save";
import { useMigrateGlossary } from "../../hooks/use-migrate-glossary";

import * as css from "./model-authoring-app.scss";
import SaveIndicator from "./save-indicator";
import { debugJson, saveInDemo } from "./params";

import {demoGlossary} from "./demo-glossary"

interface IProps {
  demo?: boolean;
  apiUrl?: string;
  initialData: IGlossaryModelAuthoringInitialData;
}

const ModelAuthoringApp = ({demo, apiUrl, initialData}: IProps) => {
  const [name, setName] = useState<string>(initialData.name);
  const [glossary, setGlossary] = useState<IGlossary>(initialData.json);
  const {saveIndicatorStatus, saveGlossary, saveName} = useSave({demo, apiUrl});

  const updateName = (newName: string) => {
    setName(newName);
    saveName(newName);
  }

  const updateGlossary = useCallback((newGlossary: IGlossary) => {
    saveGlossary(newGlossary);
    setGlossary(newGlossary);
  }, [setGlossary, saveGlossary]);

  // set the initial glossary to the default if it's empty and fill any missing updatedAt values
  useEffect(() => {
    useMigrateGlossary(initialData.json, updateGlossary);
  }, [initialData]);

  const saveSettings = useCallback((settings: IGlossarySettings) => {
    updateGlossary({...glossary, ...settings})
  }, [glossary]);

  const saveDefinitions = useCallback((definitions: IWordDefinition[]) => {
    updateGlossary({...glossary, definitions})
  }, [glossary]);

  const saveTranslations = useCallback((translations: ITranslationMap) => {
    updateGlossary({...glossary, translations})
  }, [glossary]);

  const handleClearSavedDemoData = () => {
    updateGlossary(demoGlossary.json);
    updateName(demoGlossary.name);
  }

  return (
    <div className={css.modelAuthoringApp}>
      <div className={css.header}>
        <h1>Edit Glossary: {name}</h1>
        <SaveIndicator status={saveIndicatorStatus} />
        {demo && saveInDemo && <div className={css.clearDemoData}><button onClick={handleClearSavedDemoData}>Clear Saved Demo Data</button></div>}
      </div>
      <div className={css.columns}>
        <div className={css.leftColumn}>
          <GlossaryTermsDefinitions glossary={glossary} saveDefinitions={saveDefinitions}/>
        </div>
        <div className={css.rightColumn}>
          <GlossarySettings name={name} glossary={glossary} saveSettings={saveSettings} saveName={updateName}/></div>
      </div>
      {debugJson && <div className={css.debugJson}>{JSON.stringify(glossary, null, 2)}</div>}
    </div>
  )
}

export const renderGlossaryModelAuthoring = (info: IGlossaryModelAuthoringInfo) => {
  const {containerId, apiUrl, initialData} = info
  ReactDOM.render(<ModelAuthoringApp initialData={initialData} apiUrl={apiUrl} />, document.getElementById(containerId) as HTMLElement);
}

export default ModelAuthoringApp;
