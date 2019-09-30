import * as React from "react";
import GlossaryResourceSelector, { getTokenServiceEnv } from "./glossary-resource-selector";
import { mount } from "enzyme";
import { TokenServiceClient, Resource } from "@concord-consortium/token-service";
import { IJwtResponse } from "@concord-consortium/lara-plugin-api";
import * as fetch from "jest-fetch-mock";

const setClientAndResource = jest.fn(() => {
  return Promise.resolve();
});
const uploadJSONToS3 = jest.fn();
const loadJSONFromS3 = jest.fn();
const getFirebaseJwtFn = () => jest.fn((appName: string) => {
  return new Promise<IJwtResponse>((resolve) => {
    return resolve({
      token: "test",
      claims: {}
    });
  });
});

describe("GlossaryResourceSelector component", () => {
  describe("using standalone authoring", () => {
    it("renders UI asking for JWT", () => {
      const wrapper = mount(
        <GlossaryResourceSelector
          setClientAndResource={setClientAndResource}
          uploadJSONToS3={uploadJSONToS3}
          loadJSONFromS3={loadJSONFromS3}
        />
      );
      const output = mount(
        <div className="glossaryResourceSelector">
          <form className="userSuppliedJWTForm">
            <p>
              Please enter a valid portal generated Firebase JWT (this is not needed in the inline authoring)
            </p>
            JWT: <input type="text" name="jwt" />
            <span className="button "><span className="label">Use JWT</span></span>
          </form>
        </div>
      );
      expect(wrapper.html()).toEqual(output.html());
    });
  });

  describe("using inline authoring", () => {
    it("renders options to select or create glossary when no glossaryResourceId is given in the props", () => {
      const wrapper = mount(
        <GlossaryResourceSelector
          setClientAndResource={setClientAndResource}
          uploadJSONToS3={uploadJSONToS3}
          loadJSONFromS3={loadJSONFromS3}
          getFirebaseJwt={getFirebaseJwtFn()}
        />
      );
      // need to return a promise to allow the componentDidMount() to resolve its internal promises
      return Promise
        .resolve(wrapper)
        .then(() => {
          const output = mount(
            <div className="glossaryResourceSelector">
              <div className="promptForSelectOrCreateResource">
                <span className="button "><span className="label">Select Existing Glossary</span></span>
                <span className="button "><span className="label">Create New Glossary</span></span>
              </div>
            </div>
          );
          expect(wrapper.html()).toEqual(output.html());
        });
    });

    it("renders the glossary info when a glossaryResourceId is given in the props", () => {
      const client = new TokenServiceClient({jwt: "test"});
      client.getResource = (resourceId: string) => {
        return new Promise<Resource>((resolve) => {
          resolve({
            id: "test",
            name: "glossary",
            description: "test glossary",
            type: "s3Folder",
            tool: "glossary",
            accessRules: [],
            bucket: "test-bucket",
            folder: "test-folder",
            region: "test-region"
          });
        });
      };
      const wrapper = mount(
        <GlossaryResourceSelector
          setClientAndResource={setClientAndResource}
          uploadJSONToS3={uploadJSONToS3}
          loadJSONFromS3={loadJSONFromS3}
          getFirebaseJwt={getFirebaseJwtFn()}
          glossaryResourceId="test"
          testClient={client}
        />
      );

      // need to return a promise to allow the componentDidMount() to resolve its internal promises
      return Promise
        .resolve(wrapper)
        .then(() => {
          const output = mount(
            <div className="glossaryResourceSelector">
              <div className="status">Requesting glossary...</div>
              <div />
            </div>
          );
          expect(wrapper.html()).toEqual(output.html());
          wrapper.update();
        })
        .then(() => {
          const output = mount(
            <div className="glossaryResourceSelector">
              <div className="selectedResource">
                <div>
                  <h1>glossary</h1>
                  <h2>id: test</h2>
                </div>
                <p>
                  <span className="button "><span className="label">Save</span></span>
                  <span className="button "><span className="label">Reload</span></span>
                  <span className="button "><span className="label">Select Existing Glossary</span></span>
                  <span className="button "><span className="label">Create New Glossary</span></span>
                </p>
              </div>
            </div>
          );
          expect(wrapper.html()).toEqual(output.html());
          wrapper.update();
        });
    });

  });

});

describe("getTokenServiceEnv", () => {
  afterEach(() => {
    // Cleaup.
    history.replaceState({}, "Test", "/");
  });

  it("should parse portal URL param", () => {
    expect(getTokenServiceEnv()).toEqual("staging");
    history.replaceState({}, "Test", "/?portal=https://learn.concord.org");
    expect(getTokenServiceEnv()).toEqual("production");
    history.replaceState({}, "Test", "/?portal=https://learn.staging.concord.org");
    expect(getTokenServiceEnv()).toEqual("staging");
  });
});
