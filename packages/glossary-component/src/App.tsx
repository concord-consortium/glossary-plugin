import * as React from 'react';
import './App.css';

import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import Definitions from './definitions';
import ProceedButton from './proceed-button';

const theme = createMuiTheme({
  palette: {
    primary: {
      // light: will be calculated from palette.primary.main,
      main: '#0592AF',  // Concord blue
      // dark: will be calculated from palette.primary.main,
      // contrastText: will be calculated to contast with palette.primary.main
    },
    secondary: {
      // light: will be calculated from palette.secondary.main,
      main: '#EA6D2F',  // Concord orange
      // dark: will be calculated from palette.secondary.main,
      // contrastText: will be calculated to contast with palette.secondary.main
    },
    // error: will use the default color
  },
});

interface IProps {
  word: string;
  speechPart: string;
  userDefinition?: string;
  authorDefinition: string;
  onUserSubmit: (userDefinition?: string) => void;
}


interface IState {
  userDefinition: string | undefined,
  userDidSubmit: boolean,
  userDidClose: boolean
}

class App extends React.Component<IProps, IState> {

  public state: IState = {
    userDefinition: '',
    userDidSubmit: false,
    userDidClose: false
  }

  private buttonRef: HTMLElement;

  public render() {
    const { userDidSubmit, userDidClose } = this.state;
    return (
      <MuiThemeProvider theme={theme}>
        <div className="App">
          <header className="App-header">
            <h1 className="App-title">Glossary</h1>
          </header>
          {this.renderWordSection()}
          {this.renderDefinitions()}
          <ProceedButton
            label={!userDidSubmit ? "Submit" : "Close"}
            show={!userDidClose}
            onSetButtonRef={this.handleSetButtonRef}
            onClick={!userDidSubmit ? this.handleButtonSubmit : this.handleClose} />
        </div>
      </MuiThemeProvider>
    );
  }

  private handleSetButtonRef = (elt: HTMLElement) => {
    this.buttonRef = elt;
  }

  private handleSubmit = (userDefinition: string) => {
    this.setState({ userDidSubmit: true });
    this.props.onUserSubmit(userDefinition || '');
    this.buttonRef.focus();
  }

  private handleUserDefChange = (userDefinition: string) => {
    this.setState({ userDefinition });
  }

  private handleButtonSubmit = () => {
    this.setState({ userDidSubmit: true });
    this.props.onUserSubmit(this.state.userDefinition || '');
    this.buttonRef.focus();
  }

  private handleClose = () => {
    this.setState({ userDidClose: true });
  }

  private renderWordSection() {
    if (this.state.userDidClose) { return null };
    return (
      <div className="glossary-word-section">
        <span className="glossary-word">{this.props.word}</span>
        <span className="speech-part">{this.props.speechPart}</span>
      </div>
    );
  }

  private renderDefinitions() {
    const { userDefinition, userDidSubmit, userDidClose } = this.state;
    if (userDidClose) { return null };
    return (
      <Definitions
        userDefinition={userDidSubmit ? userDefinition : this.props.userDefinition}
        authorDefinition={this.props.authorDefinition}
        onDefinitionChange={this.handleUserDefChange}
        userDidSubmit={userDidSubmit}
        onSubmit={this.handleSubmit}/>
    );
  }
}

export default App;
