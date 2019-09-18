import { IGlossary } from "../components/types";

export const wordTerm = (word: string) => `${word}.word`;
export const definitionTerm = (word: string) => `${word}.definition`;
export const imageCaptionTerm = (word: string) => `${word}.image_caption`;
export const videoCaptionTerm = (word: string) => `${word}.video_caption`;

export const glossaryToPOEditorTerms = (glossary: IGlossary) => {
  const result: {[word: string]: string}  = {};
  glossary.definitions.forEach(def => {
    result[wordTerm(def.word)] = def.word;
    result[definitionTerm(def.word)] = def.definition;
    result[imageCaptionTerm(def.word)] = def.imageCaption || "";
    result[videoCaptionTerm(def.word)] = def.videoCaption || "";
  });
  return result;
};

export const isTranslationComplete = (glossary: IGlossary, langCode: string) => {
  const { definitions, translations } = glossary;
  let complete = true;
  const translation = translations![langCode];
  definitions.forEach(def => {
    if (def.word && !translation[wordTerm(def.word)]) {
      complete = false;
    }
    if (def.definition && !translation[definitionTerm(def.word)]) {
      complete = false;
    }
    if (def.imageCaption && !translation[imageCaptionTerm(def.word)]) {
      complete = false;
    }
    if (def.videoCaption && !translation[videoCaptionTerm(def.word)]) {
      complete = false;
    }
  });
  return complete;
};
