import { IStudentInfo, IClassInfo } from "../types";
import { downloadRecording } from "../db";

// caches downloaded audioBlogUrls
const recordingCache: {[key: string]: string} = {};

export const getAudio = (url: string) => {
  return new Promise<HTMLAudioElement>((resolve, reject) => {
    if (isAudioUrl(url)) {
      resolve(new Audio(url));
      return;
    }

    if (isRecordingUrl(url)) {
      if (recordingCache[url]) {
        resolve(new Audio(recordingCache[url]));
        return;
      }

      const { valid, source, contextId, id } = parseRecordingUrl(url);
      if (!valid || !source || !contextId || !id) {
        reject("Invalid recording url");
        return;
      }

      return downloadRecording({source, contextId, id})
        .then((audioBlobUrl) => {
          recordingCache[url] = audioBlobUrl;
          resolve(new Audio(audioBlobUrl));
        })
        .catch(reject);
    }

    reject("Unable to get audio from url");
  });
};

export const isAudioUrl = (url: string) => url.match(/^data:audio/);

export const isRecordingUrl = (url: string) => url.match(/^recordingData:/);

export const isAudioOrRecordingUrl = (url: string) => isAudioUrl(url) || isRecordingUrl(url);

interface ICreateRecordingUrlOptions {
  source: string;
  contextId: string;
  id: string;
}

export const createRecordingUrl = (options: ICreateRecordingUrlOptions) => {
  const { source, contextId, id } = options;
  return `recordingData://${source}/${contextId}/${id}`;
};

export const parseRecordingUrl = (url: string) => {
  const m = url.match(/^recordingData:\/\/(.+)\/(.+)\/(.+)$/);
  if (m) {
    const [full, source, contextId, id, ...rest] = m;
    return { valid: true, source, contextId, id };
  }
  return { valid: false };
};
