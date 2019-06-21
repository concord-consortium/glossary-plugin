import {s3Upload, s3Url, CLOUDFRONT_URL, S3_BUCKET, S3_DIR_PREFIX, parseS3Url} from "./s3-helpers";
import * as AWS from "aws-sdk";

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
      const params = {
        dir: "test",
        filename: "test.txt",
        accessKey: "123",
        secretKey: "abc",
        body: "test",
        cacheControl: "max-age=123",
        contentType: "application/test"
      };
      const url = await s3Upload(params);
      expect(AWS.S3.prototype.upload).toHaveBeenCalledTimes(1);
      const expectedKey = `${S3_DIR_PREFIX}/${params.dir}/${params.filename}`;
      expect(AWS.S3.prototype.upload).toHaveBeenCalledWith({
        Bucket: S3_BUCKET,
        Key: expectedKey,
        Body: params.body,
        ACL: "public-read",
        ContentType: params.contentType,
        CacheControl: params.cacheControl
      });
      expect(url).toEqual(`${CLOUDFRONT_URL}/${expectedKey}`);
    });
  });

  describe("s3Url", () => {
    describe("it should return Cloudfront URL for a given file and directory", () => {
      expect(s3Url({filename: "test.abc", dir: "dir"})).toEqual(`${CLOUDFRONT_URL}/${S3_DIR_PREFIX}/dir/test.abc`);
    });
  });

  describe("parseS3Url", () => {
    describe("it should parse a valid Cloudfront URL for the file and directory", () => {
      // tslint:disable-next-line:max-line-length
      const {dir, filename} = parseS3Url("https://models-resources.concord.org/glossary-resources/precipitating_change_glossary/V2PluginTestGlossary.json");
      expect(dir).toEqual("precipitating_change_glossary");
      expect(filename).toEqual("V2PluginTestGlossary");
    });

    describe("it should fail to parse an invalid Cloudfront URL", () => {
      // tslint:disable-next-line:max-line-length
      const {dir, filename} = parseS3Url("https://models-resources.concord.org/glossary-resources/precipitating_change_glossary/V2PluginTestGlossary");
      expect(dir).toBeUndefined();
      expect(filename).toBeUndefined();
    });
  });
});
