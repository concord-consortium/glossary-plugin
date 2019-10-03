import { IGlossary, IStudent, ILogEvent } from "../types";

export interface ISupportsDef {
  textToSpeech: boolean;
  imageShown?: boolean; // defined only if glossary definition itself defines an image
  videoShown?: boolean; // defined only if glossary definition itself defines a video
}

// E.g.:
// const stats = {
//   user123: {
//     eardrum: {
//       clicked: true,
//       definitions: [
//         "something in your head",
//         "lets you hear things"
//       ],
//       supports: {
//         textToSpeech: true,
//         imageShown: true,
//         videoShown: false
//       }
//     }
//   }
// };
export interface IUsageStats {
  [userId: string]: {
    [term: string]: {
      clicked: boolean;
      definitions: string[];
      supports: ISupportsDef
    };
  };
}

let glossaryInstance: IGlossary | null = null;

export const getGlossaryJSON = async (glossaryUrl: string): Promise<IGlossary> => {
  if (!glossaryInstance) {
    const response = await fetch(glossaryUrl);
    glossaryInstance = await response.json();
  }
  return glossaryInstance!;
};

export const getDefaultStats = (students: IStudent[], glossary: IGlossary): IUsageStats => {
  const stats: IUsageStats = {};
  students.forEach(s => {
    stats[s.id] = {};
    glossary.definitions.forEach(def => {
      stats[s.id][def.word] = {
        clicked: false,
        definitions: [],
        supports: {
          textToSpeech: false
        }
      };
      if (def.image) {
        // Define this property only if image has been defined in glossary. Otherwise, student had no opportunity
        // to click the image icon.
        stats[s.id][def.word].supports.imageShown = false;
      }
      if (def.video) {
        // Define this property only if video has been defined in glossary. Otherwise, student had no opportunity
        // to click the video icon.
        stats[s.id][def.word].supports.videoShown = false;
      }
    });
  });
  return stats;
};

export const getUsageStats = async (students: IStudent[], events: ILogEvent[]): Promise<IUsageStats | null> => {
  if (students.length === 0 || events.length === 0) {
    return null;
  }
  const glossary = await getGlossaryJSON(events[0].glossaryUrl);
  const stats = getDefaultStats(students, glossary);
  events
    .sort((a, b) => a.timestamp - b.timestamp)
    .forEach(e => {
    if (e.event === "term clicked") {
      stats[e.userId][e.word].clicked = true;
    } else if (e.event === "definition saved") {
      stats[e.userId][e.word].definitions = e.definitions;
    } else if (e.event === "text to speech clicked") {
      stats[e.userId][e.word].supports.textToSpeech = true;
    } else if (e.event === "image icon clicked" || e.event === "image automatically shown") {
      stats[e.userId][e.word].supports.imageShown = true;
    } else if (e.event === "video icon clicked") {
      stats[e.userId][e.word].supports.videoShown = true;
    }
  });
  return stats;
};
