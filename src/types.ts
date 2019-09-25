export interface IGlossary {
  askForUserDefinition: boolean;
  showSideBar: boolean;
  definitions: IWordDefinition[];
  autoShowMediaInPopup: boolean;
  translations?: {
    [languageCode: string]: ITranslation
  };
}

export interface ITranslation {
  [word: string]: string;
}

export interface IWordDefinition {
  word: string;
  definition: string;
  image?: string;
  video?: string;
  imageCaption?: string;
  videoCaption?: string;
}

export interface ILearnerDefinitions {
  [word: string]: string[];
}
