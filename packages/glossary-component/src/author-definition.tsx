import * as React from 'react';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';

interface IProps {
  classes: any;
  definition?: string;
  onClose: () => void;
}

const styles = {
  prompt: {
    marginLeft: 10
  },
  button: {
    display: "block",
    margin: "0 0 0 auto",
    marginTop: 20,
    width: 120
  }
}

class AuthorDefinitionSection extends React.Component<IProps> {

  private buttonElt: HTMLElement | null;

  public componentDidMount() {
    if (this.buttonElt) {
      this.buttonElt.focus();
    }
  }
  
  public render() {
    const { classes } = this.props;
    return (
      <div className="definition-section"
        onKeyDown={this.handleKeyDown}>

        <p className={classes.prompt}>
          {this.props.definition}
        </p>
        <Button
          className={classes.button}
          buttonRef={this.setButtonRef}
          variant="contained"
          color="primary"
          onClick={this.handleClick}>
          Close
        </Button>
      </div>
    );
  }

  private setButtonRef = (elt: HTMLElement) => {
    this.buttonElt = elt;
  }

  private handleKeyDown = (evt: React.KeyboardEvent<HTMLDivElement>) => {
    if (evt.keyCode === 13) {
      this.handleClick();
      evt.preventDefault();
    }
  }

  private handleClick = () => {
    console.log(`handleClick`);
    const { onClose } = this.props;
    if (onClose) {
      onClose();
    }
  }
}

export default withStyles(styles)(AuthorDefinitionSection);
