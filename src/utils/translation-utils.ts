import { IGlossary } from "../types";

// Following languages are not supported by browser text to speech and require custom mp3 files provided by authors.
const TEXT_TO_SPEECH_MP3_NECESSARY: {[langCode: string]: boolean} = {
  gv: true,
  mi: true,
  mr: true
};

export enum TextKey {
  Word = "word",
  Definition = "definition",
  DiggingDeeper = "diggingDeeper",
  ImageCaption = "imageCaption",
  VideoCaption = "videoCaption",
  ImageAltText = "imageAltText",
  VideoAltText = "videoAltText",
  ClosedCaptionsUrl = "closedCaptionsUrl",
  DiggingDeeperTitle = "diggingDeeperTitle",
  MainPrompt = "mainPrompt",
  WriteDefinition = "writeDefinition"
}

export const term = {
  [TextKey.Word]: (word: string) => `${word}.word`,
  [TextKey.Definition]: (word: string) => `${word}.definition`,
  [TextKey.DiggingDeeper]: (word: string) => `${word}.digging_deeper`,
  [TextKey.ImageCaption]: (word: string) => `${word}.image_caption`,
  [TextKey.VideoCaption]: (word: string) => `${word}.video_caption`,
  [TextKey.ImageAltText]: (word: string) => `${word}.image_alt_text`,
  [TextKey.VideoAltText]: (word: string) => `${word}.video_alt_text`,
  [TextKey.ClosedCaptionsUrl]: (word: string) => `${word}.closed_captions_url`
};

const mp3Suffix = "_mp3_url";
export const mp3UrlTerm = {
  [TextKey.Word]: (word: string) => term[TextKey.Word](word) + mp3Suffix,
  [TextKey.Definition]: (word: string) => term[TextKey.Definition](word) + mp3Suffix,
  [TextKey.DiggingDeeper]: (word: string) => term[TextKey.DiggingDeeper](word) + mp3Suffix,
  [TextKey.ImageCaption]: (word: string) => term[TextKey.ImageCaption](word) + mp3Suffix,
  [TextKey.VideoCaption]: (word: string) => term[TextKey.VideoCaption](word) + mp3Suffix,
  [TextKey.ImageAltText]: (word: string) => term[TextKey.ImageAltText](word) + mp3Suffix,
  [TextKey.VideoAltText]: (word: string) => term[TextKey.VideoAltText](word) + mp3Suffix,
  [TextKey.DiggingDeeperTitle]: "digging_deeper_title_mp3_url",
  [TextKey.MainPrompt]: "main_prompt_mp3_url",
  [TextKey.WriteDefinition]: "write_definition_mp3_url",
};

export const glossaryToPOEditorTerms = (glossary: IGlossary) => {
  const result: {[word: string]: string}  = {};
  glossary.definitions.forEach(def => {
    result[term[TextKey.Word](def.word)] = def.word;
    result[mp3UrlTerm[TextKey.Word](def.word)] = "[link to mp3 recording of term]";
    result[term[TextKey.Definition](def.word)] = def.definition;
    result[mp3UrlTerm[TextKey.Definition](def.word)] = "[link to mp3 recording of definition]";
    result[mp3UrlTerm[TextKey.DiggingDeeper](def.word)] = "[link to mp3 recording of digging deeper]";
    result[term[TextKey.DiggingDeeper](def.word)] = def.diggingDeeper || "";
    result[mp3UrlTerm[TextKey.DiggingDeeper](def.word)] = "[link to mp3 recording of digging deeper]";
    result[term[TextKey.ImageCaption](def.word)] = def.imageCaption || "";
    result[mp3UrlTerm[TextKey.ImageCaption](def.word)] = "[link to mp3 recording of image caption]";
    result[term[TextKey.VideoCaption](def.word)] = def.videoCaption || "";
    result[mp3UrlTerm[TextKey.VideoCaption](def.word)] = "[link to mp3 recording of video caption]";
  });
  result[mp3UrlTerm[TextKey.DiggingDeeperTitle]] = "[link to mp3 recording of 'Digging Deeper']";
  result[mp3UrlTerm[TextKey.MainPrompt]] = "[link to mp3 recording of 'What do you think <term> means?']";
  result[mp3UrlTerm[TextKey.WriteDefinition]] =
    "[link mp3 recording of 'Write the definition in your own words here.']";
  return result;
};

export const isTranslationComplete = (glossary: IGlossary, langCode: string) => {
  const { definitions, translations } = glossary;
  let complete = true;
  const translation = translations![langCode];
  definitions.forEach(def => {
    if (def.word && !translation[term[TextKey.Word](def.word)]) {
      complete = false;
    }
    if (def.definition && !translation[term[TextKey.Definition](def.word)]) {
      complete = false;
    }
    if (def.diggingDeeper && !translation[term[TextKey.DiggingDeeper](def.word)]) {
      complete = false;
    }
    if (def.imageCaption && !translation[term[TextKey.ImageCaption](def.word)]) {
      complete = false;
    }
    if (def.videoCaption && !translation[term[TextKey.VideoCaption](def.word)]) {
      complete = false;
    }
    if (def.imageAltText && !translation[term[TextKey.ImageAltText](def.word)]) {
      complete = false;
    }
    if (def.videoAltText && !translation[term[TextKey.VideoAltText](def.word)]) {
      complete = false;
    }
  });
  return complete;
};

export const getMp3Term = (textKey: TextKey, word: string) => {
  if (textKey === "closedCaptionsUrl"){
    return null;
  }

  if (typeof mp3UrlTerm[textKey] === "string") {
    return mp3UrlTerm[textKey] as string;
  }

  return (mp3UrlTerm[textKey] as (word: string) => string)(word);
};

export const canUseBrowserTextToSpeech = (langCode: string) => {
  return !TEXT_TO_SPEECH_MP3_NECESSARY[langCode];
};

export const isValidMp3Url = (url: string) => {
  // We don't need super strict validation. Just to check if translators provided any kind of link instead of
  // human-readable descriptions provided by default.
  return url && url.startsWith("http");
};
