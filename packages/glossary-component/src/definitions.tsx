import * as React from 'react';
import TextField from '@material-ui/core/TextField';
import { withStyles } from "@material-ui/core/styles";

interface IProps {
  classes: any;
  userDefinition?: string;
  authorDefinition: string;
  userDidSubmit: boolean;
  onSubmit: (definition?: string) => void;
}
interface IState {
  userDefinition: string | undefined;
}

const styles = {
  prompt: {
    marginLeft: 10
  },
  input: {
    padding: "0 10px",
    width: "calc(100% - 20px)"
  },
  button: {
    display: "block",
    margin: "0 0 0 auto",
    marginTop: 20,
    width: 120
  }
}

class Definitions extends React.Component<IProps, IState> {

  private inputElt: HTMLInputElement | null;

  constructor(props: IProps) {
    super(props);
    this.state = { userDefinition: props.userDefinition }
  }

  public componentDidMount() {
    if (this.inputElt) {
      this.inputElt.select();
    }
  }
  
  public render() {
    const { classes } = this.props;
    return (
      <div className="definition-section">
        <p className={classes.prompt}>
          What do you think it means? Type your definition below.
        </p>
        <TextField
          className={classes.input}
          placeholder="Type your definition here"
          multiline={true}
          rows={4}
          margin="normal"
          value={this.state.userDefinition}
          autoFocus={true}
          disabled={this.props.userDidSubmit}
          inputRef={this.setInputElt}
          onKeyDown={this.handleKeyDown}
          onChange={this.handleChange}
        />
        {this.renderAuthorDefinition()}
      </div>
    );
  }

  private setInputElt = (elt: HTMLElement) => {
    this.inputElt = elt as HTMLInputElement;
  }

  private handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ userDefinition: evt.target.value });
  }

  private handleKeyDown = (evt: React.KeyboardEvent<HTMLDivElement>) => {
    if (evt.keyCode === 13) {
      this.handleClick();
      evt.preventDefault();
    }
  }

  private handleClick = () => {
    const { onSubmit } = this.props;
    if (onSubmit) {
      onSubmit(this.state.userDefinition);
    }
  }

  private renderAuthorDefinition() {
    const { classes, authorDefinition, userDidSubmit } = this.props;
    const decodedAuthorDefinition = window.atob(authorDefinition);
    return(
      userDidSubmit
        ? <p className={classes.prompt}>
            {decodedAuthorDefinition}
          </p>
        : null
    );
  }
}

export default withStyles(styles)(Definitions);
