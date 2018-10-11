import * as React from "react";
import JSONInput from "react-json-editor-ajrm";
import locale from "react-json-editor-ajrm/locale/en";
import * as Ajv from "ajv";
import schema from "../../glossary-definition-schema";

import * as css from "./json-editor.scss";

interface IProps {
  initialValue?: object;
  onChange?: (jsObject: object) => void;
  width: string;
  height: string;
}

interface IState {
  schemaError: string | null;
}

let ID = 0;
const getID = () => {
  return ID++;
};

export default class JSONEditor extends React.Component<IProps, IState> {
  public state: IState = {
    schemaError: null
  };
  private id = getID();
  private ajv = new Ajv({allErrors: true});
  private validateSchema = this.ajv.compile(schema);

  public componentDidUpdate(prevProps: IProps) {
    if (prevProps.initialValue !== this.props.initialValue) {
      this.validateAndNotify(this.props.initialValue);
    }
  }

  public render() {
    const { initialValue, width, height } = this.props;
    const { schemaError } = this.state;
    return (
      <div className={css.jsonEditor}>
        {schemaError && <div className={css.schemaError}>{schemaError}</div>}
        <JSONInput
          id={this.id}
          placeholder={initialValue}
          locale={locale}
          onChange={this.handleJSONChange}
          width={width}
          height={height}
        />
      </div>
    );
  }

  private handleJSONChange = (data: any) => {
    if (!data.jsObject) {
      // There is some syntax error. Docs:
      // https://github.com/AndrewRedican/react-json-editor-ajrm#content-values
      return;
    }
    this.validateAndNotify(data.jsObject);
  }

  private validateAndNotify = (data: any) => {
    const { onChange } = this.props;
    if (this.validate(data) && onChange) {
      onChange(data);
    }
  }

  private validate(jsObject: any) {
    if (!this.validateSchema(jsObject)) {
      // JSON is incorrect, not matching schema.
      this.setState({schemaError: this.ajv.errorsText(this.validateSchema.errors)});
      return false;
    }
    this.setState({schemaError: null});
    return true;
  }
}
