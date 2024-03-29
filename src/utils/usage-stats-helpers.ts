import { IGlossary, IStudent, ILogEvent } from "../types";
import ensureCorrectProtocol from "./ensure-correct-protocol";

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
export interface ITermStats {
  clicked: boolean;
  definitions: string[];
  supports: ISupportsDef;
}

export interface IUsageStats {
  [userId: string]: {
    [term: string]: ITermStats;
  };
}

export type Interaction = "clicked" | "definitions" | "supports";

export const INTERACTIONS = [
  {
    name: "clicked",
    label: "Click",
    expandable: false
  },
  {
    name: "definitions",
    label: "Defined",
    expandable: true
  },
  {
    label: "Supports",
    name: "supports",
    expandable: true
  },
];

interface IAllowedTerms {
  [word: string]: boolean;
}

let glossaryInstance: IGlossary | null = null;

// For jest testing:
export const resetGlossaryInstance = () => glossaryInstance = null;

export const getGlossaryJSON = async (glossaryUrl: string): Promise<IGlossary|null> => {
  if (!glossaryInstance) {
    try {
      const response = await fetch(ensureCorrectProtocol(glossaryUrl));
      glossaryInstance = await response.json();
    }
    // tslint:disable-next-line:no-console
    catch (e) {  console.warn(e); }
  }
  return glossaryInstance;
};

export const getDefaultStats = (students: IStudent[], glossary: IGlossary, allowedTerms: IAllowedTerms):
  IUsageStats => {
  const stats: IUsageStats = {};
  students.forEach(s => {
    stats[s.id] = {};
    glossary.definitions.forEach(def => {
      if (!allowedTerms[def.word]) {
        return;
      }
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

export const getAllowedTerms = (glossary: IGlossary, termsFilter: string[]): IAllowedTerms => {
  const allowed: IAllowedTerms = {};
  glossary.definitions.forEach(def => {
    for (const filter of termsFilter) {
      if (filter !== "" && def.word.includes(filter)) {
        allowed[def.word] = true;
        break;
      }
    }
  });
  if (Object.keys(allowed).length === 0) {
    // If nothing is allowed using current filters, just show everything for now.
    glossary.definitions.forEach(def => allowed[def.word] = true);
  }
  return allowed;
};

export const getUsageStats = async (students: IStudent[], events: ILogEvent[], termsFilter: string[]):
  Promise<IUsageStats | null> => {
  if (students.length === 0 || events.length === 0) {
    return null;
  }
  const urls = events.map( e => e.glossaryUrl);
  const uniqueUrls = urls.filter( (e, i) => i === urls.indexOf(e));
  const urlPromises = uniqueUrls.map( u => getGlossaryJSON(u) );
  const glossaries = await Promise.all(urlPromises);
  const glossary = glossaries.find( g => !!g);
  if (!glossary) { return null; }

  const allowedTerms = getAllowedTerms(glossary, termsFilter);
  const stats = getDefaultStats(students, glossary, allowedTerms);
  events
    .filter(e => e.event !== "plugin init" && e.event !== "language changed" && allowedTerms[e.word])
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

export const getProgress = (stats: ITermStats) => {
  let count = 0;
  let total = 3; // clicked, definitions, text to speech
  if (stats.clicked) {
    count += 1;
  }
  if (stats.definitions && stats.definitions.length > 0) {
    count += 1;
  }
  if (stats.supports.textToSpeech) {
    count += 1;
  }
  if (stats.supports.imageShown !== undefined) {
    // This element is optional. Will be undefined if glossary doesn't specify image.
    total += 1;
    if (stats.supports.imageShown) {
      count += 1;
    }
  }
  if (stats.supports.videoShown !== undefined) {
    // This element is optional. Will be undefined if glossary doesn't specify video.
    total += 1;
    if (stats.supports.videoShown) {
      count += 1;
    }
  }
  return count / total;
};
