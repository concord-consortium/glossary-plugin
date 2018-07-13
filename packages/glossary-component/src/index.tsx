import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import registerServiceWorker from './registerServiceWorker';

const authorDefinition = window.btoa("White puffy thing that makes rain.");

ReactDOM.render(
  <App word="cloud" speechPart="n."
      userDefinition={undefined}
      authorDefinition={authorDefinition}/>,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
