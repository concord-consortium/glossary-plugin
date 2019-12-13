import * as firebase from "firebase";
import "firebase/firestore";
import { IStudentSettings } from "./types";
import { ILogEvent } from "./types";

export const FIREBASE_APP = "glossary-plugin";

let dbInstance: firebase.firestore.Firestore | null = null;

export const getFirestore = () => {
  if (!dbInstance) {
    // Initialize Cloud Firestore through Firebase
    firebase.initializeApp({
      apiKey: "AIzaSyAOCFQiOechmScOoJtYLPSv1kqdsf9sr1Y",
      authDomain: "glossary-plugin.firebaseapp.com",
      databaseURL: "https://glossary-plugin.firebaseio.com",
      projectId: "glossary-plugin",
      storageBucket: "glossary-plugin.appspot.com",
      messagingSenderId: "137541784121",
      appId: "1:137541784121:web:f1881d868bfd3d647f73e8",
      measurementId: "G-RJYWLT2NE4"
    });
    dbInstance = firebase.firestore();
  }
  return dbInstance;
};

export const signInWithToken = async (rawFirestoreJWT: string) => {
  // Ensure firebase.initializeApp has been called.
  getFirestore();
  // It's actually useful to sign out first, as firebase seems to stay signed in between page reloads otherwise.
  await firebase.auth().signOut();
  return firebase.auth().signInWithCustomToken(rawFirestoreJWT);
};

export const settingsPath = (source: string, contextId: string, userId?: string) =>
  `/sources/${source}/contextId/${contextId}/studentSettings${userId ? `/${userId}` : ""}`;

export const logEventPath = (source: string, contextId: string) =>
  `/sources/${source}/contextId/${contextId}/events`;

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
  db.collection(settingsPath(source, contextId))
    .onSnapshot(snapshot => {
      if (snapshot.empty) {
        return;
      }
      onSnapshot(snapshot.docs.map(d => d.data()).filter(s => s) as IStudentSettings[]);
    }, (err: Error) => {
      // tslint:disable-next-line no-console
      console.error(err);
      throw err;
    });
};

export const watchStudentSettings = (
  source: string,
  contextId: string,
  userId: string,
  onSnapshot: (settings: IStudentSettings) => void
) => {
  const db = getFirestore();
  db.collection(settingsPath(source, contextId)).doc(userId)
    .onSnapshot(snapshot => {
      const data = snapshot.data();
      if (data) {
        onSnapshot(data as IStudentSettings);
      }
    }, (err: Error) => {
      // tslint:disable-next-line no-console
      console.error(err);
      throw err;
    });
};

export const saveLogEvent = (
  source: string,
  contextId: string,
  logEvent: ILogEvent
) => {
  const db = getFirestore();
  db.collection(logEventPath(source, contextId)).add(logEvent);
};

export const watchClassEvents = (
  source: string,
  contextId: string,
  resourceUrl: string,
  onSnapshot: (settings: ILogEvent[]) => void
) => {
  const db = getFirestore();
  db.collection(logEventPath(source, contextId))
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
    });
};
