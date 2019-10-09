import * as React from "react";

interface IProps {
  onTermsFilterUpdate: (termsFilter: string) => void;
}

interface IState {
  inputValue: string;
}

const DELAY = 700;

export default class TermsFilter extends React.Component<IProps, IState> {
  public state = {
    inputValue: ""
  };
  private timeoutId: number | undefined;

  public render() {
    const { inputValue } = this.state;
    return (
      <div style={{ marginLeft: 10 }}>
        <div>
          Terms Filter: <input
            type="text"
            value={inputValue}
            onChange={this.handleInputChange}
            style={{width: 500}}
            placeholder="Comma-separated list of terms"
          />
        </div>
      </div>
    );
  }

  private handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { onTermsFilterUpdate } = this.props;
    const newValue = event.target.value;
    this.setState({ inputValue: newValue });
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
    this.timeoutId = window.setTimeout(() => {
      onTermsFilterUpdate(newValue);
    }, DELAY);
  }
}
