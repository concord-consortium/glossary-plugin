import {s3Upload, IS3UploadParams} from "./s3-helpers";
import * as AWS from "aws-sdk";
import { TokenServiceClient, S3Resource, Credentials } from "@concord-consortium/token-service";

describe("S3 helpers", () => {
  describe("s3Upload", () => {
    beforeEach(() => {
      AWS.S3.prototype.upload = jest.fn((params) => {
        return {
          promise: () => new Promise(resolve => {
            resolve({ Key: `${params.Key}`});
          })
        };
      }) as any;
    });

    it("should call AWS.S3.upload with correct arguments and return Cloudfront URL", async () => {
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
      const params: IS3UploadParams = {
        client,
        credentials,
        filename: "test.txt",
        glossaryResource,
        body: "test",
        cacheControl: "max-age=123",
        contentType: "application/test"
      };
      const url = await s3Upload(params);
      expect(AWS.S3.prototype.upload).toHaveBeenCalledTimes(1);
      const expectedKey = `test-folder/test/test.txt`;
      expect(AWS.S3.prototype.upload).toHaveBeenCalledWith({
        Bucket: "test-bucket",
        Key: expectedKey,
        Body: params.body,
        ContentType: params.contentType,
        CacheControl: params.cacheControl
      });
      expect(url).toEqual(`https://test-bucket.s3.amazonaws.com/${expectedKey}`);
    });
  });
});
