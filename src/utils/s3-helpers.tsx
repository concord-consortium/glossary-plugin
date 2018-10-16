import * as AWS from "aws-sdk";

const S3_BUCKET = "models-resources";
const S3_DIR_PREFIX = "glossary-resources";
const S3_REGION = "us-east-1";
const CLOUDFRONT = "https://models-resources.concord.org";

interface IParams {
  dir: string;
  filename: string;
  accessKey: string;
  secretKey: string;
  body: AWS.S3.Types.Body;
  contentType?: string;
}

export function s3Upload({ dir, filename, accessKey, secretKey, body, contentType = "" }: IParams) {
  return new Promise((resolve, reject) => {
    const s3 = new AWS.S3({
      region: S3_REGION,
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    });
    s3.upload({
      Bucket: S3_BUCKET,
      Key: `${S3_DIR_PREFIX}/${dir}/${filename}`,
      Body: body,
      ACL: "public-read",
      ContentType: contentType
    }, (err: Error, data: AWS.S3.ManagedUpload.SendData) => {
      if (err) {
        reject(err.message);
      } else {
        // Construct custom Cloudfront URL instead of the direct S3 URL.
        resolve(`${CLOUDFRONT}/${data.Key}`);
      }
    });
  });
}

// In fact it returns Cloudfront URL pointing to a given object in S3 bucket.
export function s3Url({ filename, dir }: { filename: string; dir: string}) {
  return `${CLOUDFRONT}/${S3_DIR_PREFIX}/${dir}/${filename}`;
}
