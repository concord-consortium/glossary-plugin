export interface IGlossary {
  askForUserDefinition: boolean;
  definitions: IWordDefinition[];
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
