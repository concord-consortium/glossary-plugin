import * as React from "react";
import AuthoringApp, { DEFAULT_GLOSSARY } from "./authoring-app";
import GlossarySidebar from "../glossary-sidebar";
import DefinitionEditor from "./definition-editor";
import GlossaryResourceSelector from "../glossary-resource-selector";
import { shallow } from "enzyme";
import * as icons from "../icons.scss";
import { s3Upload, GLOSSARY_FILENAME } from "../../utils/s3-helpers";

import * as fetch from "jest-fetch-mock";
import { TokenServiceClient, S3Resource, Credentials } from "@concord-consortium/token-service";
(global as any).fetch = fetch;

jest.mock("../../utils/s3-helpers");

const client = new TokenServiceClient({jwt: "test"});
const glossaryResource: S3Resource = {
  id: "test",
  name: "glossary",
  description: "test glossary",
  type: "s3Folder",
  tool: "glossary",
  accessRules: [],
  bucket: "test-bucket",
  folder: "test-folder",
  region: "test-regsion"
};

describe("AuthoringApp component", () => {
  afterEach(() => {
    // Cleaup.
    history.replaceState({}, "Test", "/");
    fetch.resetMocks();
  });

  it("renders basic UI", () => {
    const wrapper = shallow(
      <AuthoringApp/>
    );
    expect(wrapper.find(GlossaryResourceSelector).length).toEqual(1);
    expect(wrapper.find("[data-cy='askForUserChange']").length).toEqual(1);
    expect(wrapper.find("[data-cy='addDef']").length).toEqual(1);
    expect(wrapper.find(GlossarySidebar).length).toEqual(1);
  });

  describe("When `showSideBar` is unchecked", () => {
    it("Should hide the sideBar", () => {
      const wrapper = shallow(
        <AuthoringApp />
      );
      wrapper.find("[data-cy='showSideBar']").simulate("change", { target: { checked: false }});
      expect(wrapper.find(GlossarySidebar).length).toEqual(0);
    });
  });

  it("lets user add a new definition", () => {
    const wrapper = shallow(
      <AuthoringApp/>
    );
    const button = wrapper.find("[data-cy='addDef']");
    button.simulate("click");
    expect(wrapper.find(DefinitionEditor).length).toEqual(1);
  });

  it("updates JSON Editor and sidebar preview when a new definition is added or existing one removed", () => {
    const wrapper = shallow(
      <AuthoringApp/>
    );
    const component = wrapper.instance() as AuthoringApp;
    const definition = { word: "test", definition: "definition" };

    // Add a new definition.
    component.addNewDef(definition);

    // GlossarySidebar component.
    expect(wrapper.find({ definitions: [ definition ]}).length).toEqual(1);

    // Now, remove it.
    component.removeDef(definition.word);

    // GlossarySidebar component.
    expect(wrapper.find({ definitions: []}).length).toEqual(1);

    // Toggle askForUserDefinition.
    wrapper.find("[data-cy='askForUserChange']").simulate("change", { target: { checked: false }});
  });

  it("renders buttons that let you edit or remove an existing definition", () => {
    const wrapper = shallow(
      <AuthoringApp/>
    );
    const component = wrapper.instance() as AuthoringApp;
    const definition = {word: "a very complex test word", definition: "definition"};

    // Add a new definition.
    component.addNewDef(definition);
    expect(wrapper.text()).toEqual(expect.stringContaining(definition.word));

    const remove = wrapper.find({ label: "Remove" });
    expect(remove.length).toEqual(1);
    remove.simulate("click");
    expect(wrapper.text()).not.toEqual(expect.stringContaining(definition.word));

    component.addNewDef(definition);
    const edit = wrapper.find({ label: "Edit" });
    expect(edit.length).toEqual(1);
    edit.simulate("click");
    expect(wrapper.find(DefinitionEditor).length).toEqual(1);
  });

  it("renders icons when definition has an image or video attached", () => {
    const wrapper = shallow(
      <AuthoringApp/>
    );
    const component = wrapper.instance() as AuthoringApp;
    const definition = {
      word: "a very complex test word",
      definition: "definition",
      image: "https://image.com",
      video: "https://video.com",
    };

    // Add a new definition.
    component.addNewDef(definition);
    expect(wrapper.text()).toEqual(expect.stringContaining(definition.word));
    expect(wrapper.find("." + icons.iconImage).length).toEqual(1);
    expect(wrapper.find("." + icons.iconVideo).length).toEqual(1);
  });

  // note: load and save buttons were moved into the GlossaryResourceSelector component
  // and are tested there

  describe(".loadJSONFromS3() method", () => {
    it("should download data and update preview", async () => {
      const glossary = {
        definitions: [{word: "test1", definition: "test 1"}],
        askForUserDefinition: false,
        showSideBar: true
      };

      fetch.mockResponse(JSON.stringify(glossary));

      const wrapper = shallow(
        <AuthoringApp/>
      );
      wrapper.setState({
        client,
        glossaryResource
      });
      await (wrapper.instance() as AuthoringApp).loadJSONFromS3();

      expect(fetch).toHaveBeenCalled();
      expect(wrapper.text()).toEqual(expect.stringContaining("Loading JSON: success!"));
      expect(wrapper.find(GlossarySidebar).props().definitions).toEqual(glossary.definitions);
    });
  });

  describe(".uploadJSONFromS3() method", () => {
    it("should upload JSON to S3", async () => {
      const wrapper = shallow(
        <AuthoringApp/>
      );
      const credentials: Credentials = {
        accessKeyId: "test",
        expiration: new Date(),
        secretAccessKey: "test",
        sessionToken: "test",
        bucket: "test-bucket",
        keyPrefix: "glossary/test/"
      };
      wrapper.setState({
        client,
        glossaryResource
      });
      client.getCredentials = jest.fn(() => {
        return new Promise<Credentials>((resolve) => {
          resolve(credentials);
        });
      });
      await (wrapper.instance() as AuthoringApp).uploadJSONToS3();
      expect(s3Upload).toHaveBeenCalledWith({
        client,
        glossaryResource,
        credentials,
        filename: GLOSSARY_FILENAME,
        body: JSON.stringify(DEFAULT_GLOSSARY, null, 2),
        contentType: "application/json",
        cacheControl: "no-cache"
      });
      expect(wrapper.text()).toEqual(expect.stringContaining("Uploading JSON to S3: success!"));
    });
  });
});
