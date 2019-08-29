import * as React from "react";
import AuthoringApp, { DEFAULT_GLOSSARY } from "./authoring-app";
import JSONEditor from "./json-editor";
import GlossarySidebar from "../glossary-sidebar";
import DefinitionEditor from "./definition-editor";
import { shallow } from "enzyme";
import * as icons from "../icons.scss";
import { s3Upload } from "../../utils/s3-helpers";

import * as fetch from "jest-fetch-mock";
(global as any).fetch = fetch;

jest.mock("../../utils/s3-helpers");

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
    expect(wrapper.find("input[name='glossaryName']").length).toEqual(1);
    expect(wrapper.find("input[name='username']").length).toEqual(1);
    expect(wrapper.find("input[name='s3AccessKey']").length).toEqual(1);
    expect(wrapper.find("input[name='s3SecretKey']").length).toEqual(1);
    expect(wrapper.find("[data-cy='save']").length).toEqual(1);
    expect(wrapper.find("[data-cy='load']").length).toEqual(1);
    expect(wrapper.find("[data-cy='askForUserChange']").length).toEqual(1);
    expect(wrapper.find("[data-cy='addDef']").length).toEqual(1);
    expect(wrapper.find(JSONEditor).length).toEqual(1);
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
    // JSONEditor component.
    expect(wrapper.find({
      initialValue: {
        askForUserDefinition: true,
        definitions: [ definition ]
      }
    }).length).toEqual(1);

    // Now, remove it.
    component.removeDef(definition.word);

    // GlossarySidebar component.
    expect(wrapper.find({ definitions: []}).length).toEqual(1);
    // JSONEditor component.
    expect(wrapper.find({
      initialValue: {
        askForUserDefinition: true,
        definitions: []
      }
    }).length).toEqual(1);

    // Toggle askForUserDefinition.
    wrapper.find("[data-cy='askForUserChange']").simulate("change", { target: { checked: false }});

    // JSONEditor component.
    expect(wrapper.find({
      initialValue: {
        askForUserDefinition: false,
        definitions: []
      }
    }).length).toEqual(1);
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

  it("sets glossary name, username, and S3 access key if they are provided in URL", () => {
    history.replaceState({}, "Test", "/authoring.html?glossaryName=testName&username=user&s3AccessKey=testS3Key");
    const wrapper = shallow(
      <AuthoringApp/>
    );
    expect(wrapper.find("input[name='glossaryName']").props().value).toEqual("testName");
    expect(wrapper.find("input[name='username']").props().value).toEqual("user");
    expect(wrapper.find("input[name='s3AccessKey']").props().value).toEqual("testS3Key");
  });

  it("should let user load JSON file if glossary name and username are provided", () => {
    const glossary = {
      definitions: [{word: "test1", definition: "test 1"}],
      askForUserDefinition: false,
    };

    fetch.mockResponse(JSON.stringify(glossary));

    const wrapper = shallow(
      <AuthoringApp/>
    );
    const instance = wrapper.instance() as AuthoringApp;
    instance.loadJSONFromS3 = jest.fn();

    expect(wrapper.find("[data-cy='load']").props().disabled).toEqual(true);
    wrapper.find("input[name='glossaryName']").simulate("change", {
      target: { name: "glossaryName", value: "testName" }
    });
    wrapper.find("input[name='username']").simulate("change", {
      target: { name: "username", value: "username" }
    });
    const load = wrapper.find("[data-cy='load']");
    expect(load.props().disabled).toEqual(false);
    load.simulate("click");
    expect(instance.loadJSONFromS3).toHaveBeenCalled();
    wrapper.unmount();
  });

  it("should let user save JSON file if glossary name and S3 details are provided", () => {
    const wrapper = shallow(
      <AuthoringApp/>
    );
    const instance = wrapper.instance() as AuthoringApp;
    instance.uploadJSONToS3 = jest.fn();

    expect(wrapper.find("[data-cy='save']").props().disabled).toEqual(true);
    wrapper.find("input[name='glossaryName']").simulate("change", {
      target: { name: "glossaryName", value: "testName" }
    });
    wrapper.find("input[name='username']").simulate("change", {
      target: { name: "username", value: "username" }
    });
    wrapper.find("input[name='s3AccessKey']").simulate("change", {
      target: { name: "s3AccessKey", value: "s3 access key" }
    });
    wrapper.find("input[name='s3SecretKey']").simulate("change", {
      target: { name: "s3SecretKey", value: "s3 secret key" }
    });
    const save = wrapper.find("[data-cy='save']");
    expect(save.props().disabled).toEqual(false);
    save.simulate("click");
    expect(instance.uploadJSONToS3).toHaveBeenCalled();
  });

  describe(".loadJSONFromS3() method", () => {
    it("should download data and update JSON Editor and preview", async () => {
      const glossary = {
        definitions: [{word: "test1", definition: "test 1"}],
        askForUserDefinition: false,
        showSideBar: true
      };

      fetch.mockResponse(JSON.stringify(glossary));

      const wrapper = shallow(
        <AuthoringApp/>
      );
      await (wrapper.instance() as AuthoringApp).loadJSONFromS3();

      expect(fetch).toHaveBeenCalled();
      expect(wrapper.text()).toEqual(expect.stringContaining("Loading JSON: success!"));
      expect(wrapper.find(JSONEditor).props().initialValue).toEqual(glossary);
      expect(wrapper.find(GlossarySidebar).props().definitions).toEqual(glossary.definitions);
    });
  });

  describe(".uploadJSONFromS3() method", () => {
    it("should upload JSON to S3", async () => {
      const wrapper = shallow(
        <AuthoringApp/>
      );
      const glossaryName = "test";
      const username = "user";
      const s3AccessKey = "s3AK";
      const s3SecretKey = "s3SK";
      wrapper.setState({
        glossaryName,
        username,
        s3AccessKey,
        s3SecretKey
      });
      await (wrapper.instance() as AuthoringApp).uploadJSONToS3();
      expect(s3Upload).toHaveBeenCalledWith({
        dir: username,
        filename: glossaryName + ".json",
        accessKey: s3AccessKey,
        secretKey: s3SecretKey,
        body: JSON.stringify(DEFAULT_GLOSSARY, null, 2),
        contentType: "application/json",
        cacheControl: "no-cache"
      });
      expect(wrapper.text()).toEqual(expect.stringContaining("Uploading JSON to S3: success!"));
    });
  });
});
