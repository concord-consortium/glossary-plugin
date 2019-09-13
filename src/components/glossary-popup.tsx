import * as React from "react";
import Definition from "./definition";
import UserDefinitions from "./user-definitions";
import * as css from "./glossary-popup.scss";

interface IProps {
  word: string;
  definition: string;
  userDefinitions?: string[];
  askForUserDefinition?: boolean;
  autoShowMedia?: boolean;
  onUserDefinitionsUpdate?: (userDefinitions: string) => void;
  imageUrl?: string;
  videoUrl?: string;
  imageCaption?: string;
  videoCaption?: string;
}

interface IState {
  currentUserDefinition: string;
  questionVisible: boolean;
}

export default class GlossaryPopup extends React.Component<IProps, IState> {
  public state: IState = {
    currentUserDefinition: "",
    questionVisible: this.props.askForUserDefinition || false
  };

  public render() {
    const { questionVisible } = this.state;
    return (
      <div className={css.glossaryPopup}>
        {questionVisible ? this.renderQuestion() : this.renderDefinition()}
      </div>
    );
  }

  private renderDefinition() {
    const { askForUserDefinition, autoShowMedia, definition, userDefinitions, imageUrl,
      videoUrl, imageCaption, videoCaption } = this.props;
    return (
      <div>
        <Definition
          definition={definition}
          imageUrl={imageUrl}
          videoUrl={videoUrl}
          imageCaption={imageCaption}
          videoCaption={videoCaption}
          autoShowMedia={autoShowMedia}
        />
        {
          askForUserDefinition && userDefinitions && userDefinitions.length > 0 &&
          <div className={css.userDefs}>
            <hr />
            <UserDefinitions userDefinitions={userDefinitions} />
            <div className={css.buttons}>
              <div className={css.button} data-cy="revise" onClick={this.handleRevise}>
                Revise my definition
              </div>
            </div>
          </div>
        }
      </div>
    );
  }

  private renderQuestion() {
    const { word, userDefinitions } = this.props;
    const { currentUserDefinition } = this.state;
    const anyUserDef = userDefinitions && userDefinitions.length > 0;

    const strings = {
      whatDoYouThink: `What do you think "${word}" means?`,
      writeDef:       "Write the definition in your own words here.",
      writeNewDef:    "Write your new definition in your own words here.",
      cancel:         "Cancel",
      dontKnow:       "I don't know yet",
      submit:         "Submit"
    };

    const placeholder = anyUserDef ? strings.writeNewDef : strings.writeDef;

    return (
      <div>
        {strings.whatDoYouThink}
        <textarea
          className={css.userDefinitionTextarea}
          placeholder={placeholder}
          onChange={this.handleTextareaChange}
          value={currentUserDefinition}
        />
        {
          // If user already provided some answer, display them below.
          userDefinitions && userDefinitions.length > 0 &&
          <div className={css.userDefs}>
            <UserDefinitions userDefinitions={userDefinitions} />
          </div>
        }
        <div className={css.buttons}>
          <div className={css.button} data-cy="submit" onClick={this.handleSubmit}>
            {strings.submit}
          </div>
          {/* Button is different depending whether user sees the question for the fist time or not */}
          <div
            className={css.button}
            data-cy="cancel"
            onClick={anyUserDef ? this.handleCancel : this.handleIDontKnow}
          >
            {anyUserDef ? strings.cancel : strings.dontKnow}
          </div>
        </div>
      </div>
    );
  }

  private addUserDefinition = (userDefinition: string) => {
    this.setState({
      questionVisible: false
    });
    if (this.props.onUserDefinitionsUpdate) {
      this.props.onUserDefinitionsUpdate(userDefinition);
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
