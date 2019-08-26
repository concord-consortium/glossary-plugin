import * as AWS from "aws-sdk";

export const CLOUDFRONT_URL = "https://models-resources.concord.org";
import { S3Resource, Credentials } from "@concord-consortium/token-service/lib/resource-types";
import { TokenServiceClient } from "@concord-consortium/token-service";

export const GLOSSARY_FILENAME = "glossary.json";

export interface IParams {
  client: TokenServiceClient;
  credentials: Credentials;
  filename: string;
  glossaryResource: S3Resource;
  body: AWS.S3.Types.Body;
  contentType?: string;
  cacheControl?: string;
}

export function s3Upload({
  client, credentials, filename, glossaryResource, body, contentType = "", cacheControl = "" }: IParams
) {
  const {bucket, region} = glossaryResource;
  const {accessKeyId, secretAccessKey, sessionToken} = credentials;
  const s3 = new AWS.S3({region, accessKeyId, secretAccessKey, sessionToken});
  const key = client.getPublicS3Path(glossaryResource, filename);
  return s3.upload({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
    CacheControl: cacheControl
  }).promise()
    .then(data => {
      return client.getPublicS3Url(glossaryResource, filename);
    })
    .catch(error => {
      throw(error.message);
    });
}

export function parseS3Url(url: string) {
  let dir;
  let filename;
  const filenameRegex = /\/([^\/]*)\.json/;
  const dirRegex = /([^\/]*)\/[^\/]*\.json/;
  let matches = filenameRegex.exec(url);
  if (matches && matches[1]) {
    filename = matches[1];
  }
  matches = dirRegex.exec(url);
  if (matches && matches[1]) {
    dir = matches[1];
  }
  return {dir, filename};
}
