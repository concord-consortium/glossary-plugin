import * as firebase from "firebase";
import "firebase/firestore";
import * as db from "./db";
import {getFirestore} from "./db";
import { IStudentSettings } from "./types";

describe("db / Firestore helpers", () => {
  let appMock: any;
  let signInWithCustomTokenMock: any;
  let signOutMock: any;

  beforeEach(() => {
    const docResult = {
      set: jest.fn(),
      onSnapshot: jest.fn()
    };
    const docMock: any = jest.fn(() => docResult);
    const collectionResult: any = {
      onSnapshot: jest.fn(),
      where: jest.fn(() => collectionResult),
      doc: docMock
    };
    const collectionMock: any = jest.fn(() => collectionResult);

    signInWithCustomTokenMock = jest.fn();
    signOutMock = jest.fn(() => new Promise<void>((resolve) => resolve()));
    appMock = {
      firestore: jest.fn(() => ({
        doc: docMock,
        collection: collectionMock
      })),
      auth: jest.fn(() => ({
        signInWithCustomToken: signInWithCustomTokenMock,
        signOut: signOutMock
      }))
    };
    jest.spyOn(firebase, "initializeApp").mockImplementation(jest.fn(() => appMock));
  });

  describe("getFirestore", () => {
    it("should call firebase.initializeApp once and return only one instance", async () => {
      const f1 = db.getFirestore();
      const f2 = db.getFirestore();
      expect(firebase.initializeApp).toHaveBeenCalledTimes(1);
      expect(appMock.firestore).toHaveBeenCalledTimes(1);
      expect(f1).toEqual(f2);
    });
  });

  describe("signInWithToken", () => {
    it("should ensure signOut and signInWithCustomToken were called once using token", async () => {
      await db.signInWithToken("token.123");
      expect(signOutMock).toHaveBeenCalled();
      expect(signInWithCustomTokenMock).toHaveBeenCalledWith("token.123");
    });
  });

  describe("settingsPath", () => {
    it("should return path for collection or single student", () => {
      const source = "test.portal";
      const contextId = "testClass";
      expect(db.settingsPath(source, contextId)).toEqual(`/sources/${source}/contextId/${contextId}/studentSettings`);
      const userId = "testUser123";
      expect(db.settingsPath(source, contextId, userId)).toEqual(
        `/sources/${source}/contextId/${contextId}/studentSettings/${userId}`
      );
    });
  });

  describe("watchClassSettings", () => {
    it("should call db.collection.onSnapshot", () => {
      db.watchClassSettings("test.portal", "testClass", jest.fn());
      const firestore = getFirestore();
      expect(firestore.collection).toHaveBeenCalled();
      expect(firestore.collection("ignoredByMock").onSnapshot).toHaveBeenCalled();
    });
  });

  describe("watchClassEvents", () => {
    it("should call db.collection.onSnapshot", () => {
      db.watchClassEvents("test.portal", "testClass", "http://lara.com/activity/123", jest.fn());
      const firestore = getFirestore();
      expect(firestore.collection).toHaveBeenCalled();
      expect(firestore.collection("ignoredByMock").onSnapshot).toHaveBeenCalled();
    });
  });

  describe("watchStudentSettings", () => {
    it("should call db.collection.doc.onSnapshot", () => {
      db.watchStudentSettings("test.portal", "testClass", "testStudent123", jest.fn());
      const firestore = getFirestore();
      expect(firestore.collection).toHaveBeenCalled();
      expect(firestore.collection("ignoredByMock").doc).toHaveBeenCalled();
      expect(firestore.collection("ignoredByMock").doc("ignoredByMock").onSnapshot).toHaveBeenCalled();
    });
  });

  describe("saveStudentSettings", () => {
    it("should call db.doc.set", () => {
      const settings: IStudentSettings = {
        userId: "testStudent123",
        preferredLanguage: "es",
        scaffoldedQuestionLevel: 1
      };
      db.saveStudentSettings("test.portal", "testClass", settings);
      const firestore = getFirestore();
      expect(firestore.doc).toHaveBeenCalled();
      expect(firestore.doc("ignoredByMock").set).toHaveBeenCalledWith(settings);
    });
  });
});
