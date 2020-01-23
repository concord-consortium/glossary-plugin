import * as firebase from "firebase";
import "firebase/firestore";
import * as db from "./db";
import {getFirestore} from "./db";
import { IStudentSettings } from "./types";

describe("db / Firestore helpers", () => {
  beforeEach(() => {
    jest.spyOn(firebase, "initializeApp").mockImplementation(jest.fn());
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
    const firestoreMock: any = {
      doc: docMock,
      collection: collectionMock
    };
    jest.spyOn(firebase, "firestore").mockImplementation(jest.fn(() => firestoreMock));
    const auth: any = {
      signInWithCustomToken: jest.fn(),
      signOut: jest.fn(() => new Promise((resolve) => resolve()))
    };
    jest.spyOn(firebase, "auth").mockImplementation(() => auth);
  });

  describe("getFirestore", () => {
    it("should call firebase.initializeApp once and return only one instance", () => {
      const f1 = db.getFirestore();
      const f2 = db.getFirestore();
      expect(firebase.initializeApp).toHaveBeenCalledTimes(1);
      expect(firebase.firestore).toHaveBeenCalledTimes(1);
      expect(f1).toEqual(f2);
    });
  });

  describe("signInWithToken", () => {
    it("should ensure firebase.initializeApp was called once and auth using token", async () => {
      await db.signInWithToken("token.123");
      expect(firebase.initializeApp).toHaveBeenCalledTimes(1);
      expect(firebase.firestore).toHaveBeenCalledTimes(1);
      expect(firebase.auth().signInWithCustomToken).toHaveBeenCalledWith("token.123");
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
      const settings: IStudentSettings = {userId: "testStudent123", preferredLanguage: "es", enableRecording: true};
      db.saveStudentSettings("test.portal", "testClass", settings);
      const firestore = getFirestore();
      expect(firestore.doc).toHaveBeenCalled();
      expect(firestore.doc("ignoredByMock").set).toHaveBeenCalledWith(settings);
    });
  });
});
