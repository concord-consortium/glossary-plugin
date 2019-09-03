import * as React from "react";
import Button from "./button";
import { TokenServiceClient, Resource, S3Resource } from "@concord-consortium/token-service";
import * as css from "./glossary-resource-selector.scss";
import { IJwtResponse } from "@concord-consortium/lara-plugin-api";

enum UIState {
  Start,
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
  testClient?: TokenServiceClient;  // for test injection
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
    status: "Loading...",
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

    if (props.testClient) {
      this.client = props.testClient;
    }
  }

  public componentDidMount() {
    if (this.props.inlineAuthoring && this.props.getFirebaseJwt) {
      this.setState({status: "Requesting JWT from portal..."});
      this.props.getFirebaseJwt(TokenServiceClient.FirebaseAppName)
        .then((jwt) => {
          this.setState({jwt: jwt.token}, () => {
            const {glossaryResourceId} = this.props;
            if (glossaryResourceId) {
              const client = this.getClient();
              if (client) {
                this.setState({status: "Requesting glossary..."});
                client.getResource(glossaryResourceId)
                  .then((glossaryResource) => {
                    this.setState({status: null}, () => this.setGlossary(glossaryResource));
                  })
                  .catch((error) => {
                    this.setState({error, uiState: UIState.PromptForSelectOrCreateResource});
                  });
              }
            }
            else {
              this.setState({status: null, uiState: UIState.PromptForSelectOrCreateResource});
            }
          });
        })
        .catch((error) => this.setState({error}));
    }
    else {
      this.setState({status: null, uiState: UIState.UserSuppliesJWT});
    }
  }

  public render() {
    const {status, error} = this.state;
    return (
      <div className={css.glossaryResourceSelector}>
        {error ? <div className={css.error}>{error.message || error.toString()}</div> : null}
        {status ? <div className={css.status}>{status.toString()}</div> : null}
        {this.renderUI()}
      </div>
    );
  }

  private renderUI(): JSX.Element {
    switch (this.state.uiState) {
      case UIState.Start:
        return <div/>;
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
    e.preventDefault();
    e.stopPropagation();
    if (this.userSuppliedJWTFieldRef.current) {
      const jwt = this.userSuppliedJWTFieldRef.current.value.trim();
      if (jwt.length > 0) {
        this.setState({jwt}, () => this.setState({uiState: UIState.PromptForSelectOrCreateResource}));
      }
    }
  }

  private renderUserSuppliedJWTForm() {
    return (
      <form className={css.userSuppliedJWTForm} onSubmit={this.handleSubmitUserSuppliedJWTForm}>
        <p>Please enter a valid portal generated Firebase JWT (this is not needed in the inline authoring)</p>
        JWT: <input type="text" name="jwt" ref={this.userSuppliedJWTFieldRef} />
        <Button label="Use JWT" data-foo="bar" data-cy="use-jwt" onClick={this.handleSubmitUserSuppliedJWTForm} />
      </form>
    );
  }

  private handleSelectExistingGlossary = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const saveResources = (resources: Resource[]) => {
      this.setState({
        status: null,
        resources,
        uiState: resources.length === 0 ? UIState.PromptForSelectOrCreateResource : UIState.SelectResource
      });
    };
    if (this.state.resources) {
      saveResources(this.state.resources);
    }
    else {
      const client = this.getClient();
      if (client) {
        this.setState({glossary: null, uiState: UIState.Start, status: "Loading glossaries..."});
        client.listResources({type: "s3Folder", tool: "glossary"})
          .then((resources) => {
            this.setState({
              status: null,
              resources,
              uiState: resources.length === 0 ? UIState.PromptForSelectOrCreateResource : UIState.SelectResource
            });
          })
          .catch((error) => this.setState({error}));
      }
      else {
        this.setState({error: "No client available"});
      }
    }
  }

  private handleCreateNewGlossary = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({uiState: UIState.CreateResource});
  }

  private renderPromptForSelectOrCreateResource() {
    const {resources} = this.state;
    const noResources = resources !== null && resources.length === 0;
    return (
      <div className={css.promptForSelectOrCreateResource}>
        {noResources
          ? "No glossaries found!"
          : <Button
              label="Select Existing Glossary"
              data-cy="select-glossary"
              onClick={this.handleSelectExistingGlossary}
            />
        }
        <Button
          label="Create New Glossary"
          data-cy="create-glossary"
          onClick={this.handleCreateNewGlossary}
        />
      </div>
    );
  }

  private handleSelectResource = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
        Glossary: <select ref={this.glossarySelectFieldRef}>{resources.map((resource) => {
          return <option key={resource.id} value={resource.id}>{resource.name}</option>;
        })}</select>
        <p>
          <Button label="Select Glossary" data-cy="select-glossary" onClick={this.handleSelectResource} />
          <Button label="Create New Glossary" data-cy="create-glossary" onClick={this.handleCreateNewGlossary}/>
        </p>
      </form>
    );
  }

  private handleCreateResource = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (this.glossaryNameFieldRef.current && this.glossaryDescriptionFieldRef.current) {
      const name = this.glossaryNameFieldRef.current.value.trim();
      const description = this.glossaryDescriptionFieldRef.current.value.trim();
      if ((name.length > 0) && (description.length > 0)) {
        const client = this.getClient();
        if (client) {
          this.setState({status: "Creating glossary..."});
          client.createResource({
            name, description, type: "s3Folder", tool: "glossary", accessRuleType: "user", accessRuleRole: "owner"
          })
          .then((glossary) => {
            // clear resources to force a load of the new resource if requested later
            this.setState({status: null, resources: null}, () => this.setGlossary(glossary));
          })
          .catch((error) => this.setState({error}));
        }
        else {
          this.setState({error: "No client available"});
        }
      }
    }
  }

  private renderCreateResource() {
    return (
      <form className={css.createResource} onSubmit={this.handleCreateResource}>
        <p>
          Name:<br/><input type="text" ref={this.glossaryNameFieldRef} />
        </p>
        <p>
          Description:<br/><input type="text" ref={this.glossaryDescriptionFieldRef} />
        </p>
        <p>
          <Button
            label="Create Glossary"
            data-cy="create-glossary"
            onClick={this.handleCreateResource}
          />
          <Button
            label="Select Existing Glossary"
            data-cy="select-glossary"
            onClick={this.handleSelectExistingGlossary}
          />
        </p>
      </form>
    );
  }

  private handleSave = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.preventDefault();
    e.stopPropagation();
    this.props.uploadJSONToS3();
  }

  private handleLoad = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.preventDefault();
    e.stopPropagation();
    this.props.loadJSONFromS3();
  }

  private renderSelectedResource() {
    const {glossary} = this.state;
    return (
      <div className={css.selectedResource}>
        <div>
          <h1>{glossary ? glossary.name : "No glossary selected!"}</h1>
          {glossary ? <h2>id: {glossary.id}</h2> : null}
        </div>
        <p>
          <Button label="Save" data-cy="save" onClick={this.handleSave}/>
          <Button label="Reload" data-cy="load" onClick={this.handleLoad}/>
          <Button
            label="Select Existing Glossary"
            data-cy="select-glossary"
            onClick={this.handleSelectExistingGlossary}
          />
          <Button label="Create New Glossary" data-cy="create-glossary" onClick={this.handleCreateNewGlossary}/>
        </p>
      </div>
    );
  }

  private setGlossary = (glossaryResource: Resource) => {
    const glossary = glossaryResource as S3Resource;
    this.setState({glossary}, () => {
      const client = this.getClient();
      if (client) {
        this.props.setClientAndResource(client, glossary).then(() => this.props.loadJSONFromS3());
        this.setState({uiState: UIState.SelectedResource});
      }
      else {
        this.setState({error: "No client available"});
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
