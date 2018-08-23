import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App word="cloud" speechPart="noun" userDefinition="user" authorDefinition="author"/>, div);
  ReactDOM.unmountComponentAtNode(div);
});
