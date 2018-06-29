/* @flow */

import { GlossaryXComponent } from '../../src';

describe('button cases', () => {

    it('should render the component and log in', (done) => {

        let email = 'foo@bar.com';

        GlossaryXComponent.render({

            env: 'test',

            wordToDefine: email,

            onSubmit(loginEmail : string) : void {

                if (loginEmail !== email) {
                    return done(new Error(`Expected ${ loginEmail } to be ${ email }`));
                }

                return done();
            }

        }, document.body);
    });
});
