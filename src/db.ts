import * as firebase from "firebase";
import "firebase/firestore";
import { IStudentSettings } from "./types";

export const FIREBASE_APP = "glossary-plugin";

// Useful only for manual testing Firebase rules.
const SKIP_SIGN_IN = false;

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

export const signInWithToken = (rawFirestoreJWT: string) => {
  // Ensure firebase.initializeApp has been called.
  getFirestore();
  // It's actually useful to sign out first, as firebase seems to stay signed in between page reloads otherwise.
  const signOutPromise = firebase.auth().signOut();
  if (!SKIP_SIGN_IN) {
    return signOutPromise.then(() => firebase.auth().signInWithCustomToken(rawFirestoreJWT));
  } else {
    return signOutPromise;
  }
};

const settingsPath = (source: string, contextId: string, userId?: string) =>
  `/sources/${source}/context_id/${contextId}/student_settings${userId ? `/${userId}` : ""}`;

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
      onSnapshot(snapshot.docs.map(d => d.data() as IStudentSettings));
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
      onSnapshot(snapshot.data() as IStudentSettings);
    }, (err: Error) => {
      // tslint:disable-next-line no-console
      console.error(err);
      throw err;
    });
};

export const saveStudentSettings = (
  source: string,
  contextId: string,
  settings: IStudentSettings
) => {
  const db = getFirestore();
  db.doc(settingsPath(source, contextId, settings.userId)).set(settings);
};
