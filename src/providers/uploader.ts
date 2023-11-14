import { S3Resource, TokenServiceClient } from "@concord-consortium/token-service";
import { createContext } from "react";
import { v4 as uuid } from "uuid";
import { getTokenServiceEnv } from "../components/authoring/glossary-resource-selector";
import { s3Upload } from "../utils/s3-helpers";

interface IUploaderProgress {
  inProgress: boolean;
  inProgressMessage?: string;
  inProgressError?: string;
  uploadedUrl?: string;
}

type Uploader = (file: File, callback: (progress: IUploaderProgress) => void) => void;

export interface IUploaderOptions {
  demo?: boolean;
  glossaryId: number;
  tokenServiceResourceId?: string;
  saveTokenServiceResourceId: (tokenServiceResourceId: string) => void;
  getFirebaseJwtUrl?: (appName: string) => string;
}

let _tokenServiceClient: TokenServiceClient;

const getTokenServiceClient = async (getFirebaseJwtUrl?: (appName: string) => string): Promise<TokenServiceClient> => {
  if (_tokenServiceClient) {
    return _tokenServiceClient;
  }

  if (!getFirebaseJwtUrl) {
    throw new Error("No Firebase JWT url provided!");
  }

  const url = getFirebaseJwtUrl(TokenServiceClient.FirebaseAppName);
  const response = await fetch(url, {method: "POST", credentials: "include"});
  const json = await response.json();

  if (json.error) {
    throw new Error(json.error);
  }

  _tokenServiceClient = new TokenServiceClient({ env: getTokenServiceEnv(), jwt: json.token });
  return _tokenServiceClient;
};

export const UploaderContext = createContext<IUploaderOptions>({
  demo: true,
  saveTokenServiceResourceId: (tokenServiceResourceId: string) => undefined,
  glossaryId: 0,
  getFirebaseJwtUrl: (appName: string) => ""
});

export const getUploader = (options: IUploaderOptions): Uploader => {
  const {demo, getFirebaseJwtUrl, glossaryId, tokenServiceResourceId, saveTokenServiceResourceId} = options;

  if (demo) {
    return (file, callback) => {
      callback({inProgress: true, inProgressMessage: `Uploading ${file.name}... Please wait.`});
      setTimeout(() => {
        callback({inProgress: true, inProgressMessage: "(this is a demo, nothing actually got uploaded)"});
        setTimeout(() => {
          callback({inProgress: false});
        }, 2000);
      }, 2000);
    };
  } else {
    return async (file, callback) => {
      try {
        callback({inProgress: true, inProgressMessage: "Connecting to token service..."});
        const client = await getTokenServiceClient(getFirebaseJwtUrl);

        let glossaryResource: S3Resource | undefined;
        if (tokenServiceResourceId) {
          try {
            glossaryResource = await client.getResource(tokenServiceResourceId) as S3Resource;
          } catch (e) {
            // no-op - will be created below
          }
        }

        if (!glossaryResource) {
          glossaryResource = await client.createResource({
            tool: "glossary",
            type: "s3Folder",
            name: `glossary-${glossaryId}`,
            description: "attachment",
            accessRuleType: "user",
            accessRuleRole: "owner"
          }) as S3Resource;

          saveTokenServiceResourceId(glossaryResource.id);
        }

        callback({inProgress: true, inProgressMessage: "Getting S3 credentials from token service..."});
        const credentials = await client.getCredentials(glossaryResource.id);

        callback({inProgress: true, inProgressMessage: `Uploading ${file.name}... Please wait.`});

        const uploadedUrl = await s3Upload({
          client,
          glossaryResource,
          credentials,
          filename: uuid() + "-" + file.name,
          body: file,
          contentType: file.type,
          cacheControl: "max-age=31536000" // 1 year
        });

        callback({inProgress: false, uploadedUrl});
      } catch(e) {
        callback({inProgress: false, inProgressError: `Uploading ${file.name} failed. ${e.toString()}.  Please try again.`});
      }
    };
  }
};


