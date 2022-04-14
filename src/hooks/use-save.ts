import { useRef, useState } from "react";
import { saveInDemo } from "../components/model-authoring/params";
import { IGlossary } from "../types";

export interface ISaveIndicatorSaving {
  mode: "saving";
}
export interface ISaveIndicatorSaved {
  mode: "saved";
}
export interface ISaveIndicatorError {
  mode: "error";
  message: string;
}

export type ISaveIndicatorStatus = ISaveIndicatorSaving | ISaveIndicatorSaved | ISaveIndicatorError;

export const demoGlossaryNameKey = "demoGlossaryName";
export const demoGlossaryJSONKey = "demoGlossaryJSON";

export const useSave = (options: { demo?: boolean; apiUrl?: string; }) => {
  const { demo, apiUrl } = options;
  const [saveIndicatorStatus, setSaveIndicatorStatus] = useState<ISaveIndicatorStatus | null>(null);
  const saveIndicatorTimeout = useRef<number | undefined>(undefined);

  const updateSaveIndicator = (status: ISaveIndicatorStatus) => {
    clearTimeout(saveIndicatorTimeout.current);
    setSaveIndicatorStatus(status);
    saveIndicatorTimeout.current = window.setTimeout(() => {
      setSaveIndicatorStatus(null);
    }, 1000);
  };

  // the glossary api endpoint accepts either/or a post body of name and json,
  // where json is the glossary data
  const save = async (body: ({ json: IGlossary; }) | ({ name: string; })) => {
    updateSaveIndicator({ mode: "saving" });

    if (demo) {
      // save to local storage for easier development
      if (saveInDemo) {
        const {json, name} = body as any;
        if (json) {
          window.localStorage.setItem(demoGlossaryJSONKey, JSON.stringify(json));
        } else if (name) {
          window.localStorage.setItem(demoGlossaryNameKey, name);
        }
      }

      setTimeout(() => updateSaveIndicator({ mode: "saved" }), 1000);
    } else if (apiUrl) {
      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
        const json = await response.json();
        updateSaveIndicator({ mode: "saved" });

      } catch (e) {
        updateSaveIndicator({ mode: "error", message: e.message });
      }
    } else {
      // tslint:disable-next-line:no-console
      console.error("No API URL provided");
    }
  };

  const saveGlossary = async (glossary: IGlossary) => save({ json: glossary });
  const saveName = async (name: string) => save({ name });

  return { saveIndicatorStatus, saveGlossary, saveName };
};
