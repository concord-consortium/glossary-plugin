/* @flow */

import deepEqual from 'deep-equal';

import { getAuthorGlossary, getUserGlossary, initGlossary, launchGlossary,
            Glossary, type IUserSubmission } from '../../src';

describe('Glossary component', () => {

    let word = 'cloud',
        authorDefinition = 'aerobatic fog',
        userDefinition = 'high flying humidity';
    
    const documentBody = document.body;

    it('should render the component and log in', (done) => {

        Glossary.render({

            env: 'test',

            word,

            authorDefinition,

            userDefinition,

            onSubmit(submission: IUserSubmission) : void {

                window.console.karma(`Submission: Word: ${submission.word}, Definition: ${submission.userDefinition}`);
                if (submission.userDefinition !== userDefinition) {
                    return done(new Error(`Expected ${ submission.userDefinition } to be ${ userDefinition }`));
                }

                return done();
            }

        }, documentBody);
    });

    it(`should initGlossary`, (done) => {
        if (getAuthorGlossary() !== undefined) {
            return done(new Error(`Expected authorGlossary to be undefined`));
        }
        if (getUserGlossary() !== undefined) {
            return done(new Error(`Expected userGlossary to be undefined`));
        }
        initGlossary({ authorGlossary: {}, userGlossary: {} });
        if (!deepEqual(getAuthorGlossary(), {})) {
            return done(new Error(`Expected authorGlossary to be {}`));
        }
        if (!deepEqual(getUserGlossary(), {})) {
            return done(new Error(`Expected userGlossary to be {}`));
        }
        return done();
    });

    it(`should launchGlossary`, (done) => {
        initGlossary({
            authorGlossary: {
                cloud: {
                    word: 'cloud',
                    regex: 'cloud',
                    definition: authorDefinition
                },
                rain: {
                    word: 'rain',
                    regex: 'rain',
                    definition: 'falling water'
                }
            },
            userGlossary: {
            }
        });
        const onSubmit = (submission: IUserSubmission): void => {
            const expectedDefinition = `user:${word}`;
            if (submission.userDefinition !== expectedDefinition) {
                return done(new Error(`Expected ${ submission.userDefinition } to be '${expectedDefinition}'`));
            }
            const definitionCount = getUserGlossary()[word].length;
            if (definitionCount !== 1) {
                return done(new Error(`Expected ${ definitionCount } to be 1`));
            }
            return done();
        };
        launchGlossary({ env: 'test', word: 'cloud', userDefinition, onSubmit });
    });

    it(`should launchGlossary again`, (done) => {
        const onSubmit = (): void => {
            const userGlossary = getUserGlossary();
            const definitionCount = userGlossary[word].length;
            if (definitionCount !== 2) {
                return done(new Error(`Expected ${ definitionCount } to be 2`));
            }
            const first = userGlossary[word][0];
            const second = userGlossary[word][1];
            if (first.timeStamp >= second.timeStamp) {
                return done(new Error(`Expected ${first.timeStamp} to be < ${second.timeStamp}`));
            }
            return done();
        };
        launchGlossary({ env: 'test', word: 'cloud', userDefinition, onSubmit });
    });

    it(`should launchGlossary with default arguments`, (done) => {
        launchGlossary({ word: 'cloud', container: document.body });
        done();
    });

});
