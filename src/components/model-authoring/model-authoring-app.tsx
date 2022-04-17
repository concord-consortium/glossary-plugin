import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import * as ReactDOM from "react-dom";

import SaveIndicator from "./save-indicator";
import { IGlossary, IGlossaryModelAuthoringInfo, IGlossaryModelAuthoringInitialData, IGlossarySettings, ITranslationMap, IWordDefinition } from "../../types";
import { GlossaryTermsDefinitions } from "./glossary-terms-definitions";
import { GlossarySettings } from "./glossary-settings";
import { useSave } from "../../hooks/use-save";
import { useMigrateGlossary } from "../../hooks/use-migrate-glossary";
import { debugJson, saveInDemo } from "./params";
import {demoGlossary} from "./demo-glossary"
import { AddTranslation, allLanguages } from "./add-translation";
import { GlossaryTranslations } from "./glossary-translations";

import * as css from "./model-authoring-app.scss";

interface IProps {
  demo?: boolean;
  apiUrl?: string;
  initialData: IGlossaryModelAuthoringInitialData;
}

const ModelAuthoringApp = ({demo, apiUrl, initialData}: IProps) => {
  const [name, setName] = useState<string>(initialData.name);
  const [glossary, setGlossary] = useState<IGlossary>(initialData.json);
  const {saveIndicatorStatus, saveGlossary, saveName} = useSave({demo, apiUrl});
  const [usedLangs, setUsedLangs] = useState<string[]>([]);

  const updateName = (newName: string) => {
    setName(newName);
    saveName(newName);
  }

  const updateGlossary = useCallback((newGlossary: IGlossary) => {
    saveGlossary(newGlossary);
    setGlossary(newGlossary);
  }, [setGlossary, saveGlossary]);

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

  // set the initial glossary to the default if it's empty and fill any missing updatedAt values
  useEffect(() => {
    useMigrateGlossary(initialData.json, updateGlossary);
  }, [initialData]);

  useEffect(() => {
    const langs = Object.keys(glossary.translations || {})
    langs.sort((a, b) => allLanguages[a].localeCompare(allLanguages[b]));
    setUsedLangs(langs);
  }, [glossary]);

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
          <AddTranslation glossary={glossary} saveTranslations={saveTranslations}/>
          {usedLangs.map(lang => (
            <GlossaryTranslations
              key={lang}
              lang={lang}
              glossary={glossary}
              saveTranslations={saveTranslations}
              usedLangs={usedLangs}
            />))}
        </div>
        <div className={css.rightColumn}>
          <GlossarySettings name={name} glossary={glossary} saveSettings={saveSettings} saveName={updateName}/>
        </div>
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
