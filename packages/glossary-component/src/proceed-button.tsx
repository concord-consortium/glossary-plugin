import * as React from 'react';
import Button from '@material-ui/core/Button';
import { withStyles } from "@material-ui/core/styles";

interface IProps {
  classes: any;
  label: string;
  show: boolean;
  onSetButtonRef: (elt: HTMLElement) => void;
  onClick: () => void;
}

const styles = {
  button: {
    display: "block",
    margin: "0 0 0 auto",
    marginTop: 20,
    width: 120
  }
}

const ProceedButton: React.SFC<IProps> = ({ classes, label, show, onSetButtonRef, onClick }) => {
  return (
    show
      ? <Button
          className={classes.button}
          variant="contained"
          color="primary"
          buttonRef={onSetButtonRef}
          onClick={onClick}>
          {label}
        </Button>
      : null
  );
}

export default withStyles(styles)(ProceedButton);
