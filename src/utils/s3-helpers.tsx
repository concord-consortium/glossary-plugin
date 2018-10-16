import * as AWS from "aws-sdk";

const S3_BUCKET = "models-resources";
const S3_DIR_PREFIX = "glossary-resources";
const S3_REGION = "us-east-1";
const CLOUDFRONT_URL = "https://models-resources.concord.org";

interface IParams {
  dir: string;
  filename: string;
  accessKey: string;
  secretKey: string;
  body: AWS.S3.Types.Body;
  contentType?: string;
  cache?: boolean;
}

export function s3Upload({ dir, filename, accessKey, secretKey, body, contentType = "", cache = false }: IParams) {
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
    ContentType: contentType
  }).promise()
    .then(data => {
      return cache ? `${CLOUDFRONT_URL}/${data.Key}` : data.Location;
    })
    .catch(error => {
      throw(error.message);
    });
}

// In fact it returns Cloudfront URL pointing to a given object in S3 bucket.
export function s3Url({ filename, dir, cache = false }: { filename: string; dir: string; cache?: boolean }) {
  return cache ?
    `${CLOUDFRONT_URL}/${S3_DIR_PREFIX}/${dir}/${filename}` :
    `https://${S3_BUCKET}.s3.amazonaws.com/${S3_DIR_PREFIX}/${dir}/${filename}`;
}
