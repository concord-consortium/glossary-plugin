import { Glossary } from '@concord-consortium/glossary-zoid';
import { decorateDOMClasses } from '@concord-consortium/text-decorator';

type IAuthorDefinition = {
  word: string;
  regex: string;
  definition: string;
};

export type IAuthorGlossary = {
  [word: string]: IAuthorDefinition;
};

type IUserDefinition = {
  word: string;
  definition: string;
  timeStamp: number;
  timeZoneOffset: number;
};

export type IUserGlossary = {
  [word: string]: IUserDefinition[];
};

export type IUserSubmission = {
  word: string;
  userDefinition: string;
};

type IInitParams = {
  authorGlossary: IAuthorGlossary;
  userGlossary: IUserGlossary;
};

let gInitParams: IInitParams;

export function initGlossary(params: IInitParams) {
  const { authorGlossary, userGlossary } = params;
  const encodedGlossary: IAuthorGlossary = {};
  Object.keys(authorGlossary).forEach((word) => {
    const { definition, ...others } = authorGlossary[word];
    encodedGlossary[word] = {
      // base64-encode author definitions so they're not trivially hackable
      definition: window.btoa(definition),
      ...others,
    };
  });
  gInitParams = { authorGlossary: encodedGlossary, userGlossary };
}

type ILaunchParams = {
  word: string;
  env?: string;
  userDefinition?: string,
  authorDefinition?: string,
  onSubmit?: (submission: IUserSubmission) => void;
  container?: HTMLElement;
};

export function decorateDOM(classNames: string | string[], container?: HTMLElement) {
  const { authorGlossary } = gInitParams;
  const wordClass = 'cc-glossary-word';
  const words: string[] = [];
  Object.keys(authorGlossary).forEach((word) => {
    const entry = authorGlossary[word];
    words.push(entry.regex);
  });
  const options = {
    words,
    replace: `<span class='${wordClass}'>$1</span>`,
  };
  const onClick = (evt: any) => {
    const word = evt.target && evt.target.textContent;
    if (word) {
      launchGlossary({ word: evt.target.textContent });
    }
  };
  decorateDOMClasses(
    classNames,
    options,
    wordClass,
    [{ type: 'click', listener: onClick }],
    container
  );
}

export function launchGlossary(params: ILaunchParams) {
  const { authorGlossary, userGlossary } = gInitParams;
  const env = params.env || 'production';
  const container = params.container || document.body;
  Object.keys(authorGlossary).forEach((word) => {
    const entry = authorGlossary[word];
    if (new RegExp(entry.regex).test(params.word)) {
      const authorDefinition = entry.definition;
      let userDefinitions = userGlossary[word];
      // pass last user definition to glossary component
      const userDefinitionEntry =
        userDefinitions && userDefinitions.length && userDefinitions[userDefinitions.length - 1];
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
          timeZoneOffset: timeStamp.getTimezoneOffset(),
        });
        if (params.onSubmit) {
          params.onSubmit(submission);
        }
      };
      Glossary.render({ env, word, authorDefinition, userDefinition, onSubmit }, container);
    }
  });
}

export function getAuthorGlossary(): IAuthorGlossary {
  return gInitParams && gInitParams.authorGlossary;
}

export function getUserGlossary(): IUserGlossary {
  return gInitParams && gInitParams.userGlossary;
}
