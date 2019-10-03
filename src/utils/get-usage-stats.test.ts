import { getDefaultStats, getGlossaryJSON, getUsageStats } from "./get-usage-stats";
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
      expect(await getGlossaryJSON("http://s3.url/glossary/123.json")).toEqual(glossary);
      expect(fetch).toHaveBeenCalledWith("http://s3.url/glossary/123.json");
      expect(fetch).toHaveBeenCalledTimes(1);

      expect(await getGlossaryJSON("http://s3.url/glossary/123.json")).toEqual(glossary);
      expect(fetch).toHaveBeenCalledTimes(1); // still 1
    });
  });

  describe("#getDefaultStats", () => {
    it("should create empty stats for list of students and glossary definition", () => {
      const students = [ { id: "123" }, { id: "321" } ] as IStudent[];
      const stats = getDefaultStats(students, glossary);
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
  });

  describe("#getUsageStats", () => {
    it("should return null if list of students or events is empty", async () => {
      const students = [ { id: "123" }  ] as IStudent[];
      const events = [ { event: "plugin init" } ] as ILogEvent[];
      expect(await getUsageStats([], events)).toEqual(null);
      expect(await getUsageStats(students, [])).toEqual(null);
    });

    it("should process list of events and update statistics correctly", async () => {
      const sId = "123";
      const students = [ { id: sId }  ] as IStudent[];
      const events = [
        { userId: sId, event: "plugin init", glossaryUrl: "http://glossary.com" },
        { userId: sId, event: "term clicked", word: "cloud" },
        { userId: sId, event: "definition saved", word: "cloud", definitions: [ "foo", "bar" ] },
        { userId: sId, event: "image icon clicked", word: "cloud" },
        { userId: sId, event: "video icon clicked", word: "cloud" },
        { userId: sId, event: "text to speech clicked", word: "cloud" }
      ] as ILogEvent[];
      const stats = await getUsageStats(students, events);
      expect(stats).not.toEqual(null);
      expect(stats![sId].cloud.clicked).toEqual(true);
      expect(stats![sId].cloud.definitions).toEqual([ "foo", "bar" ]);
      expect(stats![sId].cloud.supports.textToSpeech).toEqual(true);
      expect(stats![sId].cloud.supports.imageShown).toEqual(true);
      expect(stats![sId].cloud.supports.videoShown).toEqual(true);
    });

    it("should mark image as clicked when the glossary uses autoShowMedia", async () => {
      const sId = "123";
      const students = [ { id: sId }  ] as IStudent[];
      const events = [
        { userId: sId, event: "image automatically shown", word: "cloud" },
      ] as ILogEvent[];
      const stats = await getUsageStats(students, events);
      expect(stats).not.toEqual(null);
      expect(stats![sId].cloud.supports.imageShown).toEqual(true);
    });
  });
});
