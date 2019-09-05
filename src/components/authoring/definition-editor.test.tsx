import * as React from "react";
import DefinitionEditor, { MEDIA_S3_DIR } from "./definition-editor";
import { shallow } from "enzyme";
import { s3Upload } from "../../utils/s3-helpers";
import {v1 as uuid} from "uuid";
import { TokenServiceClient, S3Resource, Credentials } from "@concord-consortium/token-service";

jest.mock("../../utils/s3-helpers");
jest.mock("uuid", () => {
  return {
    v1: () => "mock-uuid"
  };
});
// Can't test Dropzone features:
// https://github.com/react-dropzone/react-dropzone/issues/554
// None of the solution works both in the browser and Node.
jest.mock("react-dropzone", () => {
  return {default: "dropzone mock"};
});

const noop = () => undefined;
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
  region: "test-region"
};
const credentials: Credentials = {
  accessKeyId: "test",
  expiration: new Date(),
  secretAccessKey: "test",
  sessionToken: "test",
  bucket: "test-bucket",
  keyPrefix: "glossary/test/"
};
client.getCredentials = jest.fn(() => {
  return new Promise<Credentials>((resolve) => {
    resolve(credentials);
  });
});

describe("DefinitionEditor component", () => {
  const username = "username";
  const s3AccessKey = "s3-access";
  const s3SecretKey = "s3-secret";
  const file = new File(["test"], "test-media.jpg", { type: "image/jpg" });

  it("renders basic UI", () => {
    const wrapper = shallow(
      <DefinitionEditor
        onSave={noop}
        onCancel={noop}
        client={client}
        glossaryResource={glossaryResource}
      />
    );
    expect(wrapper.find("input[name='word']").length).toEqual(1);
    expect(wrapper.find("textarea[name='definition']").length).toEqual(1);
    expect(wrapper.find("input[name='image']").length).toEqual(1);
    expect(wrapper.find("input[name='imageCaption']").length).toEqual(1);
    expect(wrapper.find("input[name='video']").length).toEqual(1);
    expect(wrapper.find("input[name='videoCaption']").length).toEqual(1);
    expect(wrapper.find("[data-cy='save']").length).toEqual(1);
    expect(wrapper.find("[data-cy='cancel']").length).toEqual(1);
  });

  describe("saving", () => {
    it("does not call onSave callback if there are any validation errors", () => {
      const saveHandler = jest.fn();

      const wrapper = shallow(
        <DefinitionEditor
          onSave={saveHandler}
          onCancel={noop}
          client={client}
          glossaryResource={glossaryResource}
        />
      );
      wrapper.setState({
        definition: {
          word: "",
          definition: "",
          image: "",
          imageCaption: "",
          video: "",
          videoCaption: ""
        }
      });
      expect(wrapper.state("error")).toEqual("");
      wrapper.find("[data-cy='save']").simulate("click");
      // "word" and "definition" values are missing.
      expect(wrapper.state("error")).not.toEqual("");
      expect(saveHandler).not.toHaveBeenCalled();
    });

    it("does call onSave callback if there are no validation errors", () => {
      const saveHandler = jest.fn();
      const wrapper = shallow(
        <DefinitionEditor
          onSave={saveHandler}
          onCancel={noop}
          client={client}
          glossaryResource={glossaryResource}
        />
      );
      wrapper.setState({
        definition: {
          word: "test",
          definition: "definition",
          image: "http://test.image.com/test.png",
          imageCaption: "",
          video: "",
          videoCaption: ""
        }
      });
      expect(wrapper.state("error")).toEqual("");
      wrapper.find("[data-cy='save']").simulate("click");
      expect(wrapper.state("error")).toEqual("");
      // Note that properties equal to "" are removed!
      expect(saveHandler).toHaveBeenCalledWith({
        word: "test",
        definition: "definition",
        image: "http://test.image.com/test.png"
      });
    });

    it("does call uploadMedia if there are some files to upload", () => {
      const saveHandler = jest.fn();
      const wrapper = shallow(
        <DefinitionEditor
          onSave={saveHandler}
          onCancel={noop}
          client={client}
          glossaryResource={glossaryResource}
        />
      );
      wrapper.setState({
        definition: {
          word: "test",
          definition: "definition",
          image: "",
          imageCaption: "",
          video: "",
          videoCaption: ""
        },
        imageFile: file
      });

      const uploadMediaMock = jest.fn();
      (wrapper.instance() as DefinitionEditor).uploadMedia = uploadMediaMock;

      wrapper.find("[data-cy='save']").simulate("click");
      expect(uploadMediaMock).toHaveBeenCalledWith(file);
    });
  });

  describe(".uploadMedia() method", () => {
    it("returns an error when username is missing", async () => {
      const wrapper = shallow(
        <DefinitionEditor
          onSave={noop}
          onCancel={noop}
          client={client}
          glossaryResource={glossaryResource}
        />
      );
      try {
        await (wrapper.instance() as DefinitionEditor).uploadMedia(file);
      } catch (e) {
        expect(e).toEqual("Can't upload media files without username and credentials.");
      }
    });

    it("uploads a file to S3 bucket", async () => {
      const wrapper = shallow(
        <DefinitionEditor
          onSave={noop}
          onCancel={noop}
          client={client}
          glossaryResource={glossaryResource}
        />
      );

      const url = await (wrapper.instance() as DefinitionEditor).uploadMedia(file);

      expect(s3Upload).toHaveBeenCalledWith({
        client,
        credentials,
        filename: uuid() + "-" + file.name,
        glossaryResource,
        body: file,
        contentType: file.type,
        cacheControl: "max-age=31536000" // 1 year
      });
      expect(url).toEqual("https://test-bucket.s3.amazonaws.com/test-folder/test/mock-uuid-test-media.jpg");
    });
  });
});
