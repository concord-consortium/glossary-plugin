import {IGlossary} from "../components/types";

export const glossaryToPOEditorTerms = (glossary: IGlossary) => {
  const result: {[word: string]: string}  = {};
  glossary.definitions.forEach(def => {
    result[`${def.word}.word`] = def.word;
    result[`${def.word}.definition`] = def.definition;
    result[`${def.word}.image_caption`] = def.imageCaption || "";
    result[`${def.word}.video_caption`] = def.videoCaption || "";
  });
  return result;
};

export const isTranslationComplete = (glossary: IGlossary, langCode: string) => {
  const { definitions, translations } = glossary;
  let complete = true;
  const translation = translations![langCode];
  definitions.forEach(def => {
    if (def.word && !translation[`${def.word}.word`]) {
      complete = false;
    }
    if (def.definition && !translation[`${def.word}.definition`]) {
      complete = false;
    }
    if (def.imageCaption && !translation[`${def.word}.image_caption`]) {
      complete = false;
    }
    if (def.videoCaption && !translation[`${def.word}.video_caption`]) {
      complete = false;
    }
  });
  return complete;
};
