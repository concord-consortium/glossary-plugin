import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';

it('renders without crashing', () => {
  const div = document.createElement('div');
  const onSubmit = (userDef: string) => userDef;
  ReactDOM.render(<App word="cloud" speechPart="noun" userDefinition="user" authorDefinition="author" onUserSubmit={onSubmit}/>, div);
  ReactDOM.unmountComponentAtNode(div);
});
