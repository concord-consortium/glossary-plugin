import * as React from "react";
import Button from "./button";
import { TokenServiceClient } from "@concord-consortium/token-service";
import * as css from "./glossary-resource-selector.scss";
import { Resource, S3Resource } from "@concord-consortium/token-service/lib/resource-types";
import { IJwtResponse } from "@concord-consortium/lara-plugin-api";

enum UIState {
  Start,
  Error,
  Status,
  UserSuppliesJWT,
  PromptForSelectOrCreateResource,
  SelectResource,
  CreateResource,
  SelectedResource
}

interface IProps {
  inlineAuthoring: boolean;
  glossaryResourceId?: string | null;
  setClientAndResource: (client: TokenServiceClient, glossaryResource: S3Resource) => Promise<void>;
  uploadJSONToS3: () => void;
  loadJSONFromS3: () => void;
  getFirebaseJwt?: (appName: string) => Promise<IJwtResponse>;
}

interface IState {
  uiState: UIState;
  jwt: string | null;
  error: any;
  status: string | null;
  glossary: S3Resource | null;
  resources: Resource[] | null;
}

export default class GlossaryResourceSelector extends React.Component<IProps, IState> {
  public state: IState = {
    uiState: UIState.Start,
    jwt: null,
    error: null,
    status: null,
    glossary: null,
    resources: null
  };

  private userSuppliedJWTFieldRef: React.RefObject<HTMLInputElement>;
  private glossaryNameFieldRef: React.RefObject<HTMLInputElement>;
  private glossaryDescriptionFieldRef: React.RefObject<HTMLInputElement>;
  private glossarySelectFieldRef: React.RefObject<HTMLSelectElement>;
  private client: TokenServiceClient | null = null;

  constructor(props: IProps) {
    super(props);
    this.userSuppliedJWTFieldRef = React.createRef<HTMLInputElement>();
    this.glossaryNameFieldRef = React.createRef<HTMLInputElement>();
    this.glossaryDescriptionFieldRef = React.createRef<HTMLInputElement>();
    this.glossarySelectFieldRef = React.createRef<HTMLSelectElement>();
  }

  public componentDidMount() {
    if (this.props.inlineAuthoring && this.props.getFirebaseJwt) {
      this.setStatus("Requesting JWT from portal...");
      this.props.getFirebaseJwt(TokenServiceClient.FirebaseAppName)
        .then((jwt) => {
          this.setState({jwt: jwt.token}, () => {
            const {glossaryResourceId} = this.props;
            if (glossaryResourceId) {
              const client = this.getClient();
              if (client) {
                this.setStatus("Requesting glossary...");
                client.getResource(glossaryResourceId)
                  .then((glossaryResource) => {
                    this.setGlossary(glossaryResource);
                  })
                  .catch(this.setError);
              }
            }
            else {
              this.setUIState(UIState.PromptForSelectOrCreateResource);
            }
          });
        })
        .catch(this.setError);
    }
    else {
      this.setUIState(UIState.UserSuppliesJWT);
    }
  }

  public render() {
    return (
      <div className={css.glossaryResourceSelector}>
        {this.renderUI()}
      </div>
    );
  }

  private renderUI(): JSX.Element {
    switch (this.state.uiState) {
      case UIState.Start:
        return <div className={css.loading}>Loading...</div>;
      case UIState.Error:
        return <div className={css.error}>{this.state.error.toString()}</div>;
      case UIState.Status:
        return <div className={css.status}>{this.state.status}</div>;
      case UIState.UserSuppliesJWT:
        return this.renderUserSuppliedJWTForm();
      case UIState.PromptForSelectOrCreateResource:
        return this.renderPromptForSelectOrCreateResource();
      case UIState.SelectResource:
        return this.renderSelectResource();
      case UIState.CreateResource:
        return this.renderCreateResource();
      case UIState.SelectedResource:
        return this.renderSelectedResource();
    }
  }

  private handleSubmitUserSuppliedJWTForm = (e: React.FormEvent) => {
    if (this.userSuppliedJWTFieldRef.current) {
      const jwt = this.userSuppliedJWTFieldRef.current.value.trim();
      if (jwt.length > 0) {
        this.setState({jwt}, () => this.setUIState(UIState.PromptForSelectOrCreateResource));
      }
    }
  }

  private renderUserSuppliedJWTForm() {
    return (
      <form className={css.userSuppliedJWTForm} onSubmit={this.handleSubmitUserSuppliedJWTForm}>
        <p>Please enter a valid portal generated Firebase JWT (this is not needed in the inline authoring)</p>
        JWT: <input type="text" ref={this.userSuppliedJWTFieldRef} />
        <input type="submit" />
      </form>
    );
  }

  private handleSelectExistingGlossary = (e: React.MouseEvent<HTMLButtonElement>) => {
    const client = this.getClient();
    if (client) {
      this.setStatus("Loading glossaries...");
      client.listResources({type: "s3Folder", tool: "glossary"})
        .then((resources) => {
          this.setState({resources}, () => {
            this.setUIState(resources.length === 0 ? UIState.PromptForSelectOrCreateResource : UIState.SelectResource);
          });
        })
        .catch(this.setError);
    }
    else {
      this.setError("No client available");
    }
  }

  private handleCreateNewGlossary = (e: React.MouseEvent<HTMLButtonElement>) => {
    this.setUIState(UIState.CreateResource);
  }

  private renderPromptForSelectOrCreateResource() {
    const {resources} = this.state;
    const noResources = resources !== null && resources.length === 0;
    return (
      <div className={css.promptForSelectOrCreateResource}>
        {noResources
          ? "No glossaries found!"
          : <button onClick={this.handleSelectExistingGlossary}>Select Existing Glossary</button>
        }
        <button onClick={this.handleCreateNewGlossary}>Create New Glossary</button>
      </div>
    );
  }

  private handleSelectResource = (e: React.FormEvent) => {
    if (this.glossarySelectFieldRef.current) {
      const id = this.glossarySelectFieldRef.current.value;
      const resource = (this.state.resources || []).find((r) => r.id === id);
      if (resource) {
        this.setGlossary(resource);
      }
    }
  }

  private renderSelectResource() {
    const resources = this.state.resources || [];
    return (
      <form className={css.selectResource} onSubmit={this.handleSelectResource}>
        <div>
          Glossary: <select ref={this.glossarySelectFieldRef}>{resources.map((resource) => {
            return <option key={resource.id} value={resource.id}>{resource.name}</option>;
          })}</select>
        </div>
        <input type="submit" />
      </form>
    );
  }

  private handleCreateResource = (e: React.FormEvent) => {
    if (this.glossaryNameFieldRef.current && this.glossaryDescriptionFieldRef.current) {
      const name = this.glossaryNameFieldRef.current.value.trim();
      const description = this.glossaryDescriptionFieldRef.current.value.trim();
      if ((name.length > 0) && (description.length > 0)) {
        const client = this.getClient();
        if (client) {
          this.setStatus("Creating glossary...");
          client.createResource({
            name, description, type: "s3Folder", tool: "glossary", accessRuleType: "user", accessRuleRole: "owner"
          })
          .then(this.setGlossary)
          .catch(this.setError);
        }
        else {
          this.setError("No client available");
        }
      }
    }
  }

  private renderCreateResource() {
    return (
      <form className={css.createResource} onSubmit={this.handleCreateResource}>
        <div>
          Name: <input type="text" ref={this.glossaryNameFieldRef} />
        </div>
        <div>
          Description: <input type="text" ref={this.glossaryDescriptionFieldRef} />
        </div>
        <input type="submit" />
      </form>
    );
  }

  private handleSave = (e: React.MouseEvent<HTMLSpanElement>) => {
    this.props.uploadJSONToS3();
  }

  private handleLoad = (e: React.MouseEvent<HTMLSpanElement>) => {
    this.props.loadJSONFromS3();
  }

  private renderSelectedResource() {
    const {glossary} = this.state;
    const label = glossary ? `${glossary.name} (#${glossary.id})` : "No glossary selected!";
    return (
      <div className={css.selectedResource}>
        <p>
          {label}
        </p>
        <p>
          <Button label="Save" data-cy="save" onClick={this.handleSave}/>
          <Button label="Load" data-cy="load" onClick={this.handleLoad}/>
        </p>
      </div>
    );
  }

  private setError = (error: any) => {
    if (error && error.message) {
      error = error.message;
    }
    else {
      error = error.toString();
    }
    // tslint:disable-next-line:no-console
    console.error(error);
    this.setState({error, uiState: UIState.Error});
  }

  private setStatus = (status: string) => {
    this.setState({status, uiState: UIState.Status});
  }

  private setUIState = (uiState: UIState) => {
    this.setState({uiState});
  }

  private setGlossary = (glossaryResource: Resource) => {
    const glossary = glossaryResource as S3Resource;
    this.setState({glossary}, () => {
      const client = this.getClient();
      if (client) {
        this.props.setClientAndResource(client, glossary).then(() => this.props.loadJSONFromS3());
        this.setUIState(UIState.SelectedResource);
      }
      else {
        this.setError("No client available");
      }
    });
  }

  private getClient() {
    if (!this.client) {
      const {jwt} = this.state;
      if (jwt) {
        this.client = new TokenServiceClient({jwt});
      }
    }
    return this.client;
  }
}
