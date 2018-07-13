import deepEqual from 'deep-equal';
import { Glossary } from '@concord-consortium/glossary-zoid';
import {
  getAuthorGlossary,
  getUserGlossary,
  decorateDOM,
  initGlossary,
  launchGlossary,
  IUserSubmission,
} from '../../src';
import { dispatchSimulatedEvent } from '../test-utils.ts';

describe('Glossary client', () => {
  // tslint:disable:no-shadowed-variable
  // tslint:disable:no-magic-numbers

  function isEqualAuthorGlossary(expectedAuthorGlossary) {
    const actualAuthorGlossary = getAuthorGlossary();
    const decodedAuthorGlossary = {};
    for (const word in actualAuthorGlossary) {
      if (actualAuthorGlossary.hasOwnProperty(word)) {
        const { definition, ...others } = actualAuthorGlossary[word];
        decodedAuthorGlossary[word] = { definition: atob(definition), ...others };
      }
    }
    return deepEqual(decodedAuthorGlossary, expectedAuthorGlossary);
  }

  function mockGlossaryRender() {
    return jest.spyOn(Glossary, 'render').mockImplementation((params) => {
      const { word } = params;
      let { userDefinition } = params;
      if (!userDefinition) {
        userDefinition = `user:${word}`;
      }
      if (params.onSubmit) {
        // response is asynchronous
        setTimeout(() => {
          params.onSubmit({ word, userDefinition });
        }, 100);
      }
    });
  }

  const word = 'cloud';
  const authorDefinition = 'aerobatic fog';
  const userDefinition = 'high flying humidity';

  it(`should initGlossary with empty glossary`, () => {
    expect(getAuthorGlossary()).toBeUndefined();
    expect(getUserGlossary()).toBeUndefined();

    initGlossary({ authorGlossary: {}, userGlossary: {} });

    expect(deepEqual(getAuthorGlossary(), {})).toBe(true);
    expect(deepEqual(getUserGlossary(), {})).toBe(true);
  });

  it(`should initGlossary with words`, () => {
    const authorGlossary = {
      cloud: {
        word: 'cloud',
        regex: 'cloud',
        definition: authorDefinition,
      },
      rain: {
        word: 'rain',
        regex: 'rain',
        definition: 'falling water',
      },
    };
    const userGlossary = {};
    initGlossary({ authorGlossary, userGlossary });
    expect(isEqualAuthorGlossary(authorGlossary)).toBe(true);
    expect(deepEqual(getUserGlossary(), userGlossary)).toBe(true);
  });

  it(`should decorateDOM`, () => {
    // Set up our document body
    document.body.innerHTML = `
        <div class='cc-glossarize'>
          rain
        </div>`;
    decorateDOM('cc-glossarize');

    const wordElts = document.getElementsByClassName('cc-glossary-word');
    expect(wordElts.length).toBe(1);
    const wordElt = wordElts[0];

    const spy = mockGlossaryRender();
    dispatchSimulatedEvent(wordElt, 'click');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it(`should launchGlossary`, (done) => {
    const onSubmit = (submission: IUserSubmission): void => {
      const expectedDefinition = `user:${word}`;
      if (submission.userDefinition !== expectedDefinition) {
        return done(
          new Error(`Expected ${submission.userDefinition} to be '${expectedDefinition}'`)
        );
      }
      const definitionCount = getUserGlossary()[word].length;
      if (definitionCount !== 1) {
        return done(new Error(`Expected ${definitionCount} to be 1`));
      }
      return done();
    };
    const spy = mockGlossaryRender();
    launchGlossary({ env: 'test', word: 'cloud', userDefinition, onSubmit });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it(`should launchGlossary again`, (done) => {
    const onSubmit = (): void => {
      const userGlossary = getUserGlossary();
      const definitionCount = userGlossary[word].length;
      const expectedCount = 2;
      if (definitionCount !== expectedCount) {
        return done(new Error(`Expected ${definitionCount} to be 2`));
      }
      const first = userGlossary[word][0];
      const second = userGlossary[word][1];
      if (first.timeStamp >= second.timeStamp) {
        return done(new Error(`Expected ${first.timeStamp} to be < ${second.timeStamp}`));
      }
      return done();
    };
    const spy = mockGlossaryRender();
    launchGlossary({ env: 'test', word: 'cloud', userDefinition, onSubmit });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it(`should launchGlossary with default arguments`, () => {
    const spy = mockGlossaryRender();
    launchGlossary({ word: 'cloud', container: document.body });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it(`should handle clicks on empty words`, () => {
    // Set up our document body
    document.body.innerHTML = `
        <div class='cc-glossarize'>
          <span class='cc-glossary-word'></span>
        </div>`;
    decorateDOM('cc-glossarize');

    const wordElts = document.getElementsByClassName('cc-glossary-word');
    expect(wordElts.length).toBe(1);
    const wordElt = wordElts[0];

    const spy = mockGlossaryRender();
    dispatchSimulatedEvent(wordElt, 'click');
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
