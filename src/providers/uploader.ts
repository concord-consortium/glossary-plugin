import { createContext } from 'react';

interface IUploaderProgress {
  inProgress: boolean;
  inProgressMessage?: string;
  inProgressError?: string;
}

interface IUploader {
  upload: (file: File, callback: (progress: IUploaderProgress) => void) => void;
}

export const UploaderContext = createContext<IUploader>({
  upload: () => {
    // no-op
  }
});

export const getUploaderProviderValue = (options: {demo?: boolean}): IUploader => {
  if (options.demo) {
    return {
      upload: (file, callback) => {
        callback({inProgress: true, inProgressMessage: `Uploading ${file.name}... Please wait.`});
        setTimeout(() => {
          callback({inProgress: true, inProgressMessage: "(this is a demo, nothing actually got uploaded)"});
          setTimeout(() => {
            callback({inProgress: false});
          }, 2000);
        }, 2000);
      }
    }
  } else {
    return {
      upload: (file, callback) => {
        callback({inProgress: false, inProgressError: "Uploads are not supported yet.  Stay tuned!"});

        /*
          TODO: implement something like this when we have a client and a glossary id (this requires a change in Lara to expose the authoring context)

          callback({inProgress: true, inProgressMessage: `Uploading ${file.name}... Please wait.`});
          try {
            const credentials = await client.getCredentials(glossaryResource.id);
            const url = await s3Upload({
              client,
              glossaryResource,
              credentials,
              filename: uuid() + "-" + file.name,
              body: file,
              contentType: file.type,
              cacheControl: "max-age=31536000" // 1 year
            });
            callback({inProgress: false});
          } catch (e) {
            callback({inProgress: false, inProgressError: `Uploading ${file.name} failed.  Please try again.`});
          }
        }
      */

      }
    }
  }
}


