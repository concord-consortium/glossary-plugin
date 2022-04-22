import {
  getDefaultStats, getGlossaryJSON, getProgress,
  getUsageStats, getAllowedTerms, resetGlossaryInstance
} from "./usage-stats-helpers";
import * as fetch from "jest-fetch-mock";
import { IGlossary, ILogEvent, IStudent } from "../types";
(global as any).fetch = fetch;

describe("usage statistic helpers", () => {
  const glossary: IGlossary = {
    definitions: [
      {
        word: "cloud",
      },
      {
        word: "eardrum",
        image: "http://image.com"
      },
      {
        word: "atmosphere",
        image: "http://image.com",
        video: "http://video.com"
      },
    ]
  } as IGlossary;

  beforeEach(() => {
    fetch.resetMocks();
    fetch.mockResponse(JSON.stringify(glossary));
  });

  describe("#getGlossaryJSON", () => {
    it("should fetch glossary JSON and cache it for later use", async () => {
      expect(await getGlossaryJSON("https://s3.url/glossary/123.json")).toEqual(glossary);
      expect(fetch).toHaveBeenCalledWith("https://s3.url/glossary/123.json");
      expect(fetch).toHaveBeenCalledTimes(1);

      expect(await getGlossaryJSON("https://s3.url/glossary/123.json")).toEqual(glossary);
      expect(fetch).toHaveBeenCalledTimes(1); // still 1
    });
  });

  describe("#getDefaultStats", () => {
    it("should create empty stats for list of students and glossary definition", () => {
      const students = [ { id: "123" }, { id: "321" } ] as IStudent[];
      const stats = getDefaultStats(students, glossary, {cloud: true, eardrum: true, atmosphere: true});
      students.forEach(s => {
        expect(stats[s.id].cloud.clicked).toEqual(false);
        expect(stats[s.id].cloud.definitions).toEqual([]);
        expect(stats[s.id].cloud.supports.textToSpeech).toEqual(false);
        expect(stats[s.id].cloud.supports.imageShown).toEqual(undefined); // no image provided in glossary
        expect(stats[s.id].cloud.supports.videoShown).toEqual(undefined); // no video provided in glossary

        expect(stats[s.id].eardrum.clicked).toEqual(false);
        expect(stats[s.id].eardrum.definitions).toEqual([]);
        expect(stats[s.id].eardrum.supports.textToSpeech).toEqual(false);
        expect(stats[s.id].eardrum.supports.imageShown).toEqual(false);
        expect(stats[s.id].eardrum.supports.videoShown).toEqual(undefined);  // no video provided in glossary

        expect(stats[s.id].atmosphere.clicked).toEqual(false);
        expect(stats[s.id].atmosphere.definitions).toEqual([]);
        expect(stats[s.id].atmosphere.supports.textToSpeech).toEqual(false);
        expect(stats[s.id].atmosphere.supports.imageShown).toEqual(false);
        expect(stats[s.id].atmosphere.supports.videoShown).toEqual(false);
      });
    });

    it("should respect term filters", () => {
      const students = [ { id: "123" }, { id: "321" } ] as IStudent[];
      const stats = getDefaultStats(students, glossary, {cloud: true});
      students.forEach(s => {
        expect(stats[s.id].cloud.clicked).toEqual(false);
        expect(stats[s.id].cloud.definitions).toEqual([]);
        expect(stats[s.id].cloud.supports.textToSpeech).toEqual(false);
        expect(stats[s.id].cloud.supports.imageShown).toEqual(undefined); // no image provided in glossary
        expect(stats[s.id].cloud.supports.videoShown).toEqual(undefined); // no video provided in glossary

        expect(stats[s.id].eardrum).toEqual(undefined);
        expect(stats[s.id].atmosphere).toEqual(undefined);
      });
    });
  });

  describe("#getUsageStats", () => {
    it("should return null if list of students or events is empty", async () => {
      const students = [ { id: "123" }  ] as IStudent[];
      const events = [ { event: "plugin init" } ] as ILogEvent[];
      expect(await getUsageStats([], events, [])).toEqual(null);
      expect(await getUsageStats(students, [], [])).toEqual(null);
    });

    describe("when some students glossary urls are invalid", () => {
      beforeEach( () => {
        resetGlossaryInstance();
        const happyResponse = [JSON.stringify(glossary), {status: 200}];
        const sadResponse = [null, {status: 404}];
        fetch.mockResponses(sadResponse, happyResponse);
      });
      it("should return usage stats if there is one valid glossary", async () => {
        const students = [ { id: "123" }  ] as IStudent[];
        const events = [
          { glossaryUrl: "fail", event: "plugin init"},
          { glossaryUrl: "success", event: "plugin init" }
        ] as ILogEvent[];
        const usageStats = await getUsageStats(students, events, []);
        expect(usageStats).not.toBe(null);
      });
    });
    describe("when all students glossary urls are invalid", () => {
      beforeEach( () => {
        resetGlossaryInstance();
        const sadResponse = [null, {status: 404}];
        fetch.mockResponses(sadResponse, sadResponse);
      });
      it("should fail with no usageStats", async () => {
        const students = [ { id: "123" }  ] as IStudent[];
        const events = [
          { glossaryUrl: "fail", event: "plugin init"},
          { glossaryUrl: "fail", event: "plugin init" }
        ] as ILogEvent[];
        const usageStats = await getUsageStats(students, events, []);
        expect(usageStats).toEqual(null);
      });
    });

    it("should process list of events and update statistics correctly", async () => {
      const sId = "123";
      const students = [ { id: sId }  ] as IStudent[];
      const events = [
        { userId: sId, event: "plugin init", glossaryUrl: "https://glossary.com" },
        { userId: sId, event: "term clicked", word: "cloud" },
        { userId: sId, event: "definition saved", word: "cloud", definitions: [ "foo", "bar" ] },
        { userId: sId, event: "image icon clicked", word: "cloud" },
        { userId: sId, event: "video icon clicked", word: "cloud" },
        { userId: sId, event: "text to speech clicked", word: "cloud" }
      ] as ILogEvent[];
      const stats = await getUsageStats(students, events, []);
      expect(stats).not.toEqual(null);
      expect(stats![sId].cloud.clicked).toEqual(true);
      expect(stats![sId].cloud.definitions).toEqual([ "foo", "bar" ]);
      expect(stats![sId].cloud.supports.textToSpeech).toEqual(true);
      expect(stats![sId].cloud.supports.imageShown).toEqual(true);
      expect(stats![sId].cloud.supports.videoShown).toEqual(true);
    });

    it("should respect term filters", async () => {
      const sId = "123";
      const students = [ { id: sId }  ] as IStudent[];
      const events = [
        { userId: sId, event: "plugin init", glossaryUrl: "https://glossary.com" },
        { userId: sId, event: "term clicked", word: "cloud" },
        { userId: sId, event: "term clicked", word: "eardrum" },
      ] as ILogEvent[];
      const stats = await getUsageStats(students, events, ["cloud"]);
      expect(stats).not.toEqual(null);
      expect(stats![sId].cloud.clicked).toEqual(true);
      expect(stats![sId].eardrum).toEqual(undefined);
    });

    it("should mark image as clicked when the glossary uses autoShowMedia", async () => {
      const sId = "123";
      const students = [ { id: sId }  ] as IStudent[];
      const events = [
        { userId: sId, event: "image automatically shown", word: "cloud" },
      ] as ILogEvent[];
      const stats = await getUsageStats(students, events, []);
      expect(stats).not.toEqual(null);
      expect(stats![sId].cloud.supports.imageShown).toEqual(true);
    });
  });

  describe("#getProgress", () => {
    it("should return progress based on the interactions", () => {
      expect(getProgress({
        clicked: false,
        definitions: [],
        supports: {
          textToSpeech: false
        }
      })).toEqual(0);

      expect(getProgress({
        clicked: true,
        definitions: [],
        supports: {
          textToSpeech: false
        }
      })).toBeCloseTo(0.3333);

      expect(getProgress({
        clicked: true,
        definitions: [ "def" ],
        supports: {
          textToSpeech: false
        }
      })).toBeCloseTo(0.6666);

      expect(getProgress({
        clicked: true,
        definitions: [ "def" ],
        supports: {
          textToSpeech: true
        }
      })).toEqual(1);

      expect(getProgress({
        clicked: true,
        definitions: [ "def" ],
        supports: {
          textToSpeech: false,
          imageShown: false
        }
      })).toBeCloseTo(0.5);

      expect(getProgress({
        clicked: true,
        definitions: [ "def" ],
        supports: {
          textToSpeech: false,
          imageShown: false,
          videoShown: false
        }
      })).toBeCloseTo(0.4);

      expect(getProgress({
        clicked: true,
        definitions: [ "def" ],
        supports: {
          textToSpeech: false,
          imageShown: true,
          videoShown: false
        }
      })).toBeCloseTo(0.6);

      expect(getProgress({
        clicked: true,
        definitions: [ "def" ],
        supports: {
          textToSpeech: false,
          imageShown: true,
          videoShown: true
        }
      })).toBeCloseTo(0.8);
    });
  });

  describe("#getAllowedTerms", () => {
    it("should return hash object with allowed terms", () => {
      expect(getAllowedTerms(glossary, ["cloud", "eardrum"])).toEqual({
        cloud: true,
        eardrum: true
      });
      // substrings are ok too
      expect(getAllowedTerms(glossary, ["clo", "ear"])).toEqual({
        cloud: true,
        eardrum: true
      });
    });
  });
});
