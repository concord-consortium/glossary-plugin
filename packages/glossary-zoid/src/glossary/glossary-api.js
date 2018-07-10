/* @flow */

import { Glossary } from './component';

type IAuthorDefinition = {
  word: string,
  regex: string,
  definition: string
};

type IAuthorGlossary = {
  [word: string]: IAuthorDefinition
};

type IUserDefinition = {
  word: string,
  definition: string,
  timeStamp: number,
  timeZoneOffset: number
};

type IUserGlossary = {
  [word: string]: IUserDefinition[]
};

export type IUserSubmission = {
    word: string,
    userDefinition: string
};

type IInitParams = {
  authorGlossary: IAuthorGlossary,
  userGlossary: IUserGlossary
};

let gInitParams : IInitParams;

export function initGlossary(params: IInitParams)
{
  const { authorGlossary, userGlossary } = params;
  let encodedGlossary: IAuthorGlossary = {};
  for (let word in authorGlossary) {
    if (authorGlossary.hasOwnProperty(word)) {
      const { definition, ...others } = authorGlossary[word];
      encodedGlossary[word] = {
        // base64-encode author definitions so they're not trivially hackable
        definition: window.btoa(definition),
        ...others
      };
    }
  }
  gInitParams = { authorGlossary: encodedGlossary, userGlossary };
}

type ILaunchParams = {
  word: string,
  env?: string,
  onSubmit?: (submission: IUserSubmission) => void,
  container?: ?HTMLElement
};

export function launchGlossary(params: ILaunchParams) {
  const { authorGlossary } = gInitParams;
  let { userGlossary } = gInitParams;
  const env = params.env || 'production';
  const container = params.container || document.body;
  for (let word in authorGlossary) {
    if (authorGlossary.hasOwnProperty(word)) {
      const entry = authorGlossary[word];
      if ((new RegExp(entry.regex)).test(params.word)) {
        const authorDefinition = entry.definition;
        let userDefinitions = userGlossary[word];
        // pass last user definition to glossary component
        const userDefinitionEntry = userDefinitions && userDefinitions.length &&
                                    userDefinitions[userDefinitions.length - 1];
        const userDefinition = userDefinitionEntry ? userDefinitionEntry.definition : undefined;
        const onSubmit = (submission: IUserSubmission): void => {
          const timeStamp = new Date();
          if (!userDefinitions) {
            userDefinitions = userGlossary[word] = [];
          }
          userDefinitions.push({
            word: submission.word,
            definition: submission.userDefinition,
            timeStamp: timeStamp.getTime(),
            timeZoneOffset: timeStamp.getTimezoneOffset()
          });
          if (params.onSubmit) {
            params.onSubmit(submission);
          }
        };
        Glossary.render({ env, word, authorDefinition, userDefinition, onSubmit }, container);
      }
    }
  }
}

export function getAuthorGlossary(): IAuthorGlossary {
  return gInitParams && gInitParams.authorGlossary;
}

export function getUserGlossary(): IUserGlossary {
  return gInitParams && gInitParams.userGlossary;
}
