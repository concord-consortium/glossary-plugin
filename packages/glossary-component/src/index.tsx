import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import registerServiceWorker from './registerServiceWorker';
// glossary-zoid is necessary, so this app can use properties passed from the parent window, in window.xprops.
// It's a bit strange to require something from dist, but I cannot see any other option.
// All the official examples do that in the HTML page. We don't really want that, as then the glossary-zoid
// component would need to be deployed somewhere. It would make it more complicated both in development and production.
// Zoid could export some helper function like `initIframe` and `initPopup` but it doesn't seem it's available.
// See: https://github.com/krakenjs/zoid/issues/177
import '@concord-consortium/glossary-zoid/dist/glossary-zoid.popup';

// // xprops are provided by Zoid.
declare let xprops: any;

const DEFAULT_PROPS = {
  word: 'cloud',
  authorDefinition: 'White puffy thing that makes rain.',
  userDefinition: undefined,
  onSubmit: (userDefinition: string) => {
    console.log(userDefinition)
  }
};

const initialProps = typeof xprops !== 'undefined' ? xprops : DEFAULT_PROPS;

ReactDOM.render(
  <App
     word={initialProps.word}
     speechPart="n."
     userDefinition={initialProps.userDefinition}
     authorDefinition={initialProps.authorDefinition}
     onUserSubmit={initialProps.onSubmit}
  />,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
