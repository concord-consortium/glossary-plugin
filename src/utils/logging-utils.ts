type ILogEventName = "plugin init" | "term clicked" | "definition saved" | "text to speech clicked" |
  "image icon clicked" | "video icon clicked" | "image automatically shown";

export interface ILogEvent {
  event: ILogEventName;
  userId: string;
  contextId: string;
  resourceUrl: string;
  glossaryUrl: string;
  timestamp: number;
}

export interface ISimpleEventPartial {
  event: ILogEventName;
}

export interface ITermClickedEventPartial extends ILogEvent {
  event: "term clicked";
  word: string;
}

export interface IDefinitionSavedEventPartial extends ILogEvent {
  event: "definition saved";
  definition: string;
}

export interface ITextToSpeechClicked extends ILogEvent {
  event: "text to speech clicked";
  textType: "definition" | "image caption" | "video caption";
}

export type ILogEventPartial = ISimpleEventPartial | ITermClickedEventPartial | IDefinitionSavedEventPartial |
  ITextToSpeechClicked;
