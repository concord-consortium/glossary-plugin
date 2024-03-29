import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import * as ReactDOM from "react-dom";

import SaveIndicator from "./save-indicator";
import { IGlossary, IGlossaryModelAuthoringInfo, IGlossaryModelAuthoringInitialData, IGlossarySettings, IProject, ITranslationMap, IWordDefinition } from "../../types";
import { GlossaryTermsDefinitions } from "./glossary-terms-definitions";
import { GlossarySettings } from "./glossary-settings";
import { useSave } from "../../hooks/use-save";
import { useMigrateGlossary } from "../../hooks/use-migrate-glossary";
import { debugJson, saveInDemo, dangerouslyEditJson } from "./params";
import {demoGlossary} from "./demo-glossary"
import { AddTranslation, allLanguages } from "./add-translation";
import { GlossaryTranslations } from "./glossary-translations";
import { DangerouslyEditJson } from "./dangerously-edit-json";
import { IUploaderOptions, UploaderContext } from "../../providers/uploader";

import * as css from "./model-authoring-app.scss";

interface IProps {
  demo?: boolean;
  apiUrl?: string;
  initialData: IGlossaryModelAuthoringInitialData;
  getFirebaseJwtUrl?: (appName: string) => string;
}

const ModelAuthoringApp = ({demo, apiUrl, initialData, getFirebaseJwtUrl}: IProps) => {
  const {canEdit} = initialData;
  const [name, setName] = useState<string>(initialData.name);
  const [project, setProject] = useState<IProject>(initialData.project);
  const [glossary, setGlossary] = useState<IGlossary>(initialData.json);
  const {saveIndicatorStatus, saveGlossary, saveName, saveProject} = useSave({demo, apiUrl, canEdit});
  const [usedLangs, setUsedLangs] = useState<string[]>([]);
  const projects = initialData.projects;

  const updateName = (newName: string) => {
    setName(newName);
    saveName(newName);
  }

  const updateProject = (newProject: IProject) => {
    setProject(newProject);
    saveProject(newProject);
  }

  const updateGlossary = useCallback((newGlossary: IGlossary) => {
    if (canEdit) {
      saveGlossary(newGlossary);
      setGlossary(newGlossary);
    }
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

  const saveTokenServiceResourceId = useCallback((tokenServiceResourceId: string) => {
    updateGlossary({...glossary, tokenServiceResourceId})
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

  const renderLeftColumn = () => {
    if (glossary.definitions) {
      const options: IUploaderOptions = {
        demo,
        tokenServiceResourceId: glossary.tokenServiceResourceId,
        saveTokenServiceResourceId,
        glossaryId: initialData.id,
        getFirebaseJwtUrl
      }
      return (
        <UploaderContext.Provider value={options}>
          <GlossaryTermsDefinitions
            glossary={glossary}
            saveDefinitions={saveDefinitions}
            canEdit={canEdit}
          />
          {canEdit && <AddTranslation glossary={glossary} saveTranslations={saveTranslations}/>}
          {usedLangs.map(lang => (
            <GlossaryTranslations
              key={lang}
              lang={lang}
              glossary={glossary}
              saveTranslations={saveTranslations}
              usedLangs={usedLangs}
              canEdit={canEdit}
            />))}
        </UploaderContext.Provider>
      )
    }
  }

  return (
    <div className={css.modelAuthoringApp}>
      <div className={css.header}>
        <h1>{canEdit ? "Edit" : "View"} Glossary: {name}</h1>
        <SaveIndicator status={saveIndicatorStatus} />
        {demo && saveInDemo && <div className={css.clearDemoData}><button onClick={handleClearSavedDemoData}>Clear Saved Demo Data</button></div>}
      </div>
      {!canEdit && <div className={css.readonlyGlossaryNotice}>You are not the author of this glossary so any changes you make will not be reflected in the UI or saved.</div>}
      {dangerouslyEditJson && <DangerouslyEditJson glossary={glossary} saveGlossary={updateGlossary}/>}
      <div className={css.columns}>
        <div className={css.leftColumn}>
          {renderLeftColumn()}
        </div>
        <div className={css.rightColumn}>
          <GlossarySettings
            name={name}
            project={project}
            projects={projects}
            glossary={glossary}
            saveSettings={saveSettings}
            saveName={updateName}
            saveProject={updateProject}
            canEdit={canEdit}
          />
        </div>
      </div>
      {debugJson && <div className={css.debugJson}>{JSON.stringify(glossary, null, 2)}</div>}
    </div>
  )
}

export const renderGlossaryModelAuthoring = (info: IGlossaryModelAuthoringInfo) => {
  const {containerId, apiUrl, initialData, getFirebaseJwtUrl} = info
  ReactDOM.render(<ModelAuthoringApp initialData={initialData} apiUrl={apiUrl} getFirebaseJwtUrl={getFirebaseJwtUrl} />, document.getElementById(containerId) as HTMLElement);
}

export default ModelAuthoringApp;
