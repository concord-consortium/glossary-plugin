import * as firebase from "firebase";
import "firebase/firestore";
import { v4 as uuid } from "uuid";
import { IStudentSettings, IStudentInfo, IClassInfo } from "./types";
import { ILogEvent } from "./types";
import { createRecordingUrl } from "./utils/audio";

export const FIREBASE_APP = "glossary-plugin";

export const FirestoreBatchUpdateSize = 100; // 500 is max, use 100 for better progress updates
export const MaxFirestoreBatchUpdateSize = 500; // 500 is max in Firebase

let dbInstance: firebase.firestore.Firestore | null = null;

let signedIn = false;

let app: firebase.app.App;

let snapshotSubscriptions: (() => void)[] = [];

export const getFirestore = () => {
  if (!dbInstance) {
    // Initialize Cloud Firestore through Firebase
    app = firebase.initializeApp({
      apiKey: "AIzaSyAOCFQiOechmScOoJtYLPSv1kqdsf9sr1Y",
      authDomain: "glossary-plugin.firebaseapp.com",
      databaseURL: "https://glossary-plugin.firebaseio.com",
      projectId: "glossary-plugin",
      storageBucket: "glossary-plugin.appspot.com",
      messagingSenderId: "137541784121",
      appId: "1:137541784121:web:f1881d868bfd3d647f73e8",
      measurementId: "G-RJYWLT2NE4"
    }, "glossary-plugin");
    dbInstance = app.firestore();
  }
  return dbInstance;
};

export const signInWithToken = async (rawFirestoreJWT: string) => {
  // Ensure firebase.initializeApp has been called.
  getFirestore();
  // cancel current subscriptions so we don't get errors when signing out
  snapshotSubscriptions.forEach(unsubscribe => unsubscribe());
  snapshotSubscriptions = [];

  // It's actually useful to sign out first, as firebase seems to stay signed in between page reloads otherwise.
  await app.auth().signOut();
  const result = app.auth().signInWithCustomToken(rawFirestoreJWT);
  signedIn = true;
  return result;
};

export const settingsPath = (source: string, contextId: string, userId?: string) =>
  `/sources/${source}/contextId/${contextId}/studentSettings${userId ? `/${userId}` : ""}`;

export const logEventPath = (source: string, contextId: string) =>
  `/sources/${source}/contextId/${contextId}/events`;

export const recordingsPath = (source: string, contextId: string) =>
  `/sources/${source}/contextId/${contextId}/recordings`;

export const recordingDataPath = (source: string, contextId: string, id?: string) =>
  `/sources/${source}/contextId/${contextId}/recordingData${id ? `/${id}` : ""}`;

export const saveStudentSettings = (
  source: string,
  contextId: string,
  settings: IStudentSettings
) => {
  const db = getFirestore();
  db.doc(settingsPath(source, contextId, settings.userId)).set(settings);
};

export const watchClassSettings = (
  source: string,
  contextId: string,
  onSnapshot: (settings: IStudentSettings[]) => void
) => {
  const db = getFirestore();
  snapshotSubscriptions.push(db.collection(settingsPath(source, contextId))
    .onSnapshot(snapshot => {
      if (snapshot.empty) {
        return;
      }
      onSnapshot(snapshot.docs.map(d => d.data()).filter(s => s) as IStudentSettings[]);
    }, (err: Error) => {
      // tslint:disable-next-line no-console
      console.error(err);
      throw err;
    }));
};

export const watchStudentSettings = (
  source: string,
  contextId: string,
  userId: string,
  onSnapshot: (settings: IStudentSettings) => void
) => {
  const db = getFirestore();
  snapshotSubscriptions.push(db.collection(settingsPath(source, contextId)).doc(userId)
    .onSnapshot(snapshot => {
      const data = snapshot.data();
      if (data) {
        onSnapshot(data as IStudentSettings);
      }
    }, (err: Error) => {
      // tslint:disable-next-line no-console
      console.error(err);
      throw err;
    }));
};

export const sendLogEventToFirestore = (
  source: string,
  contextId: string,
  logEvent: ILogEvent
) => {
  const db = getFirestore();
  db.collection(logEventPath(source, contextId)).add(logEvent);
};

export const sendBulkLogEventsToFirestore = async (
  source: string,
  contextId: string,
  logEvents: ILogEvent[]
) => {
  if (logEvents.length > MaxFirestoreBatchUpdateSize) {
    throw new Error("Too many log events to write in one batch!");
  }
  const db = getFirestore();
  const batch = db.batch();
  const collection = db.collection(logEventPath(source, contextId));
  logEvents.forEach((logEvent) => {
    // there is no batch.add, you just use set on a new reference
    const ref = collection.doc();
    batch.set(ref, logEvent);
  });
  await batch.commit();
};

export const watchClassEvents = (
  source: string,
  contextId: string,
  resourceUrl: string,
  onSnapshot: (settings: ILogEvent[]) => void
) => {
  const db = getFirestore();
  snapshotSubscriptions.push(db.collection(logEventPath(source, contextId))
    .where("resourceUrl", "==", resourceUrl)
    .onSnapshot(snapshot => {
      if (snapshot.empty) {
        onSnapshot([]);
      }
      onSnapshot(snapshot.docs.map(d => d.data() as ILogEvent));
    }, (err: Error) => {
      // tslint:disable-next-line no-console
      console.error(err);
      throw err;
    }));
};

interface IUploadRecordingOptions {
  audioBlobUrl: string;
  studentInfo?: IStudentInfo;
  demoMode?: boolean;
}

interface IRecording {
  userId: string;
  createdAt: number | firebase.firestore.FieldValue;
}

interface IRecordingData {
  userId: string;
  audioBlobUrl: string;
  createdAt: number | firebase.firestore.FieldValue;
}

export const uploadRecording = (options: IUploadRecordingOptions) => {
  return new Promise<string>((resolve, reject) => {
    const { audioBlobUrl, studentInfo, demoMode } = options;

    if (demoMode) {
      // fake an upload after a timeout
      setInterval(() => {
        resolve(audioBlobUrl);
      }, 1000);
      return;
    }

    if (!signedIn || !studentInfo) {
      reject(new Error("Sorry, uploads are not allowed as you are not signed into the portal"));
      return;
    }

    const db = getFirestore();
    const { source, contextId, userId } = studentInfo;
    const createdAt = firebase.firestore.FieldValue.serverTimestamp();
    const id = uuid();

    const recording: IRecording = {userId, createdAt};
    const recordingData: IRecordingData = {userId, createdAt, audioBlobUrl};

    db.collection(recordingsPath(source, contextId)).doc(id)
      // create a lightweight record with the user and date that can be queried
      .set(recording)
      // upload the large audio blob url to same key in a parallel collection
      .then(() => db.collection(recordingDataPath(source, contextId)).doc(id).set(recordingData))
      // return an url representing the recording
      .then(() => resolve(createRecordingUrl({source, contextId, id})))
      .catch(reject);
  });
};

interface IDownloadRecordingOptions {
  source: string;
  contextId: string;
  id: string;
  demoMode?: boolean;
}

export const downloadRecording = (options: IDownloadRecordingOptions) => {
  return new Promise<string>((resolve, reject) => {
    const { source, contextId, id, demoMode } = options;

    if (demoMode) {
      reject("Can't download audio in demo mode!");
      return;
    }

    if (!signedIn) {
      reject(new Error("Sorry, downloads are not allowed as you are not signed into the portal"));
      return;
    }

    const db = getFirestore();
    db.collection(recordingDataPath(source, contextId)).doc(id).get()
      .then((doc) => {
        const data = doc.data() as IRecordingData | undefined;
        if (data && data.audioBlobUrl) {
          resolve(data.audioBlobUrl);
        } else {
          reject("Unable to find audio blob url");
        }
      })
      .catch(reject);
  });
};
