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

export interface IStudent {
  name: string;
  id: string;
}

export interface IClassInfo {
  source: string;
  contextId: string;
  students: IStudent[];
}

export interface IStudentSettings {
  userId: string;
  preferredLanguage: string;
}
