import * as AWS from "aws-sdk";

import { S3Resource, Credentials } from "@concord-consortium/token-service/lib/resource-types";
import { TokenServiceClient } from "@concord-consortium/token-service";

export const GLOSSARY_FILENAME = "glossary.json";

export interface IS3UploadParams {
  client: TokenServiceClient;
  credentials: Credentials;
  filename: string;
  glossaryResource: S3Resource;
  body: AWS.S3.Types.Body;
  contentType?: string;
  cacheControl?: string;
}

export function s3Upload({
  client, credentials, filename, glossaryResource, body, contentType = "", cacheControl = "" }: IS3UploadParams
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
