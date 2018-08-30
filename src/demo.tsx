import * as React from 'react';
import * as ReactDOM from 'react-dom';
import GlossaryPopup from './components/glossary-popup';

// tslint:disable-next-line:no-console
const newUserDefinition = (userDefinitions: string[]) => { console.log('User definitions:', userDefinitions); };

export function renderPopupAuthorOnly(id: string) {
  ReactDOM.render(
    <GlossaryPopup
      word='eardrum'
      definition='An eardrum is a membrane, or thin piece of skin, stretched tight like a drum.'
    />,
    document.getElementById(id) as HTMLElement
  );
}

export function renderPopupUserDefinition(id: string) {
  ReactDOM.render(
    <GlossaryPopup
      word='eardrum'
      definition='An eardrum is a membrane, or thin piece of skin, stretched tight like a drum.'
      askForUserDefinition={true}
      onUserDefinitionsUpdate={newUserDefinition}
    />,
    document.getElementById(id) as HTMLElement
  );
}
