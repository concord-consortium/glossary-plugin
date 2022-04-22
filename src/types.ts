export interface IGlossary {
  askForUserDefinition: boolean;
  showSideBar: boolean;
  definitions: IWordDefinition[];
  autoShowMediaInPopup: boolean;
  showIDontKnowButton: boolean;
  enableStudentRecording: boolean;
  disableReadAloud: boolean;
  enableStudentLanguageSwitching: boolean;
  translations?: ITranslationMap;
}

export type ITranslationMap = Record<string, ITranslation>;

export interface ITranslation {
  [word: string]: string;
}

export interface IWordDefinition {
  word: string;
  definition: string;
  diggingDeeper?: string;
  image?: string;
  zoomImage?: string;
  video?: string;
  imageCaption?: string;
  videoCaption?: string;
  createdAt?: number;
  updatedAt?: number;
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
  enableRecording: boolean;
  scaffoldedQuestionLevel: number;
}

export interface IStudentInfo {
  source: string;
  contextId: string;
  userId: string;
}

export interface IBasicEvent {
  userId: string;
  contextId: string;
  resourceUrl: string;
  glossaryUrl: string;
  timestamp: number;
}

export interface ISimpleEvent extends IBasicEvent {
  event: "plugin init";
}

export interface ITermClickedEvent extends IBasicEvent {
  event: "term clicked";
  word: string;
  clickedWord: string;
  popupState: string;
}

export interface IWordSpecificEvent extends IBasicEvent {
  event: "image icon clicked" | "video icon clicked" | "image automatically shown";
  word: string;
}

export interface IDefinitionSavedEvent extends IBasicEvent {
  event: "definition saved";
  word: string;
  definition: string;
  definitions: string[];
}

export interface ITextToSpeechClickedEvent extends IBasicEvent {
  event: "text to speech clicked";
  word: string;
  textType: "definition" | "image caption" | "video caption";
}

export interface ILanguageChanged extends IBasicEvent {
  event: "language changed";
  previousLanguage: string;
  newLanguage: string;
  previousLanguageCode: string;
  newLanguageCode: string;
}

// These types define data stored in the Firestore.
export type ILogEvent = ISimpleEvent | ITermClickedEvent | IWordSpecificEvent | IDefinitionSavedEvent |
  ITextToSpeechClickedEvent | ILanguageChanged;

// Partial types are used by the runtime code to provide specific options of the event to #log() function.
// Then, loggingContext provider (PluginApp) transforms these partials into full events and saves in Firestore.
export type ISimpleEventPartial = Pick<ISimpleEvent, "event">;
export type ITermClickedEventPartial = Pick<ITermClickedEvent, "event" | "word" | "clickedWord" | "popupState">;
export type IWordSpecificEventPartial = Pick<IWordSpecificEvent, "event" | "word">;
export type IDefinitionSavedEventPartial = Pick<IDefinitionSavedEvent, "event" | "word" | "definition" | "definitions">;
export type ITextToSpeechClickedEventPartial = Pick<ITextToSpeechClickedEvent, "event" | "word" | "textType">;
export type ILanguageChangedPartial = Pick<
  ILanguageChanged,
  "event" | "previousLanguage" | "newLanguage" | "previousLanguageCode" | "newLanguageCode"
>;

export type ILogEventPartial = ISimpleEventPartial | ITermClickedEventPartial | IWordSpecificEventPartial |
  IDefinitionSavedEventPartial | ITextToSpeechClickedEventPartial | ILanguageChangedPartial;

export type ExpandableInteraction = "definitions" | "supports";

// for new model authoring

export interface IGlossaryModelAuthoringInitialData {
  name: string
  json: IGlossary
  canEdit: boolean
}

export interface IGlossaryModelAuthoringInfo {
  apiUrl: string;
  containerId: string;
  initialData: IGlossaryModelAuthoringInitialData;
}

export type IGlossarySettings = Omit<Omit<IGlossary, "definitions">, "translations">;