import * as AWS from "aws-sdk";

export const S3_BUCKET = "models-resources";
export const S3_DIR_PREFIX = "glossary-resources";
export const S3_REGION = "us-east-1";
export const CLOUDFRONT_URL = "https://models-resources.concord.org";

export interface IParams {
  dir: string;
  filename: string;
  accessKey: string;
  secretKey: string;
  body: AWS.S3.Types.Body;
  contentType?: string;
  cacheControl?: string;
}

export function s3Upload({ dir, filename, accessKey, secretKey, body, contentType = "", cacheControl = "" }: IParams) {
  const s3 = new AWS.S3({
    region: S3_REGION,
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
  });
  const key = `${S3_DIR_PREFIX}/${dir}/${filename}`;
  return s3.upload({
    Bucket: S3_BUCKET,
    Key: key,
    Body: body,
    ACL: "public-read",
    ContentType: contentType,
    CacheControl: cacheControl
  }).promise()
    .then(data => {
      return `${CLOUDFRONT_URL}/${data.Key}`;
    })
    .catch(error => {
      throw(error.message);
    });
}

// In fact it returns Cloudfront URL pointing to a given object in S3 bucket.
export function s3Url({ filename, dir }: { filename: string; dir: string; }) {
  return `${CLOUDFRONT_URL}/${S3_DIR_PREFIX}/${dir}/${filename}`;
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
