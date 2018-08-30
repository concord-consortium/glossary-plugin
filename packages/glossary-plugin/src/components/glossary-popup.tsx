import * as React from 'react';
import './glossary-popup.css';

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

class GlossaryPopup extends React.Component<IGlossaryPopupProps, IGlossaryPopupState> {
  public state: IGlossaryPopupState = {
    currentUserDefinition: '',
    questionVisible: this.props.askForUserDefinition || false,
    userDefinitions: this.props.initialUserDefinitions || [],
  };

  public render() {
    const { word, definition } = this.props;
    const { questionVisible, userDefinitions, currentUserDefinition } = this.state;
    return (
      <div className='glossary-popup'>
        <div className='glossary-popup-content'>
          { !questionVisible &&
          definition
          }
          {
            questionVisible &&
            <div>
              What do you think "{word}" means?
              <textarea
                className='glossary-popup-user-definition'
                placeholder='Write your definition here'
                onChange={this.handleTextareaChange}
                value={currentUserDefinition}
              />
              {
                userDefinitions.length === 0 &&
                <div className='glossary-popup-buttons'>
                  <div className='glossary-popup-button' onClick={this.handleSubmit}>
                    Submit
                  </div>
                  <div className='glossary-popup-button' onClick={this.handleIDontKnow}>
                    I don't know yet
                  </div>
                </div>
              }
            </div>
          }
          {
            userDefinitions.length > 0 &&
            <div className="glossary-popup-user-definitions">
              { !questionVisible && <hr/> }
              <div>
                { questionVisible ? <b>My previous definition:</b> : <b>My definition:</b> }
              </div>
              { userDefinitions[userDefinitions.length - 1] }
              <div className='glossary-popup-buttons'>
                { !questionVisible &&
                <div className='glossary-popup-button' onClick={this.handleRevise}>
                  Revise my definition
                </div>
                }
                {
                  questionVisible &&
                  <div>
                    <div className='glossary-popup-button' onClick={this.handleSubmit}>
                      Submit
                    </div>
                    <div className='glossary-popup-button' onClick={this.handleCancel}>
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
  };

  private handleTextareaChange = (evt: any) => {
    this.setState({ currentUserDefinition: evt.target.value });
  };

  private handleSubmit = () => {
    const { currentUserDefinition } = this.state;
    this.addUserDefinition(currentUserDefinition);
  };

  private handleIDontKnow = () => {
    this.addUserDefinition('I don\'t know yet');
  };

  private handleCancel = () => {
    this.setState({ questionVisible: false });
  };

  private handleRevise = () => {
    this.setState({ questionVisible: true });
  };
}

export default GlossaryPopup;
