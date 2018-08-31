import * as React from "react";
import * as css from "./glossary-popup.scss";

interface IGlossaryPopupProps {
  word: string;
  definition: string;
  askForUserDefinition?: boolean;
  initialUserDefinitions?: string[];
  onUserDefinitionsUpdate?: (userDefinitions: string[]) => void;
}

interface IGlossaryPopupState {
  currentUserDefinition: string;
  questionVisible: boolean;
  userDefinitions: string[];
}

export default class GlossaryPopup extends React.Component<IGlossaryPopupProps, IGlossaryPopupState> {
  public state: IGlossaryPopupState = {
    currentUserDefinition: "",
    questionVisible: this.props.askForUserDefinition || false,
    userDefinitions: this.props.initialUserDefinitions || [],
  };

  public render() {
    const { word, definition } = this.props;
    const { questionVisible, userDefinitions, currentUserDefinition } = this.state;
    // The logic below is a bit scattered, but at least we don't have to repeat markup too much. And generally
    // it's not a rocket science, so I wouldn't worry about it too much. The most important is to handle
    // input and output (calling onUserDefinitionsUpdate) correctly as that's what the plugin code cares about.
    return (
      <div className={css.popup}>
        <div className={css.content}>
          {!questionVisible && definition}
          {
            questionVisible &&
            <div>
              What do you think "{word}" means?
              <textarea
                className={css.userDefinition}
                placeholder="Write your definition here"
                onChange={this.handleTextareaChange}
                value={currentUserDefinition}
              />
              {
                // Special case when there are no user definition yet. There's a "I don't know yet" button.
                userDefinitions.length === 0 &&
                <div className={css.buttons}>
                  <div className={css.button} onClick={this.handleSubmit}>
                    Submit
                  </div>
                  <div className={css.button} onClick={this.handleIDontKnow}>
                    I don't know yet
                  </div>
                </div>
              }
            </div>
          }
          {
            // If user already provided some answer, display them below. Note that it's also visible when
            // the question is active. There are some differences in buttons below this section, headers, and so on.
            userDefinitions.length > 0 &&
            <div className={css.userDefinitions}>
              {!questionVisible && <hr/>}
              <div>
                {questionVisible ? <b>My previous definition:</b> : <b>My definition:</b>}
              </div>
              {userDefinitions[userDefinitions.length - 1]}
              <div className={css.buttons}>
                {!questionVisible &&
                <div className={css.button} onClick={this.handleRevise}>
                  Revise my definition
                </div>
                }
                {
                  questionVisible &&
                  <div>
                    <div className={css.button} onClick={this.handleSubmit}>
                      Submit
                    </div>
                    <div className={css.button} onClick={this.handleCancel}>
                      Cancel
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </div>
    );
  }

  private addUserDefinition = (userDefinition: string) => {
    const { userDefinitions } = this.state;
    const newUserDefinitions: string[] = userDefinitions.concat(userDefinition);
    this.setState({
      questionVisible: false,
      userDefinitions: newUserDefinitions
    });
    if (this.props.onUserDefinitionsUpdate) {
      this.props.onUserDefinitionsUpdate(newUserDefinitions);
    }
  }

  private handleTextareaChange = (evt: any) => {
    this.setState({ currentUserDefinition: evt.target.value });
  }

  private handleSubmit = () => {
    const { currentUserDefinition } = this.state;
    this.addUserDefinition(currentUserDefinition);
  }

  private handleIDontKnow = () => {
    this.addUserDefinition("I don't know yet");
  }

  private handleCancel = () => {
    this.setState({ questionVisible: false });
  }

  private handleRevise = () => {
    this.setState({ questionVisible: true });
  }
}
