/* @flow */

import '../../../src'; // eslint-disable-line import/no-unassigned-import

let { word, userDefinition } = window.xprops;
if (!userDefinition) {
  userDefinition = `user:${word}`;
}
window.xprops.onSubmit({ word, userDefinition });
