import * as AWS from "aws-sdk";

const S3_BUCKET = "models-resources";
const S3_DIR_PREFIX = "glossary-resources";
const S3_REGION = "us-east-1";

export function s3Upload({ dir, filename, accessKey, secretKey, body, contentType = "" }:
 { dir: string, filename: string, accessKey: string, secretKey: string, body: string, contentType?: string }) {
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
    }, (err: Error) => {
      if (err) {
        reject(err.message);
      } else {
        resolve();
      }
    });
  });
}

export function s3Url({ filename, dir }: { filename: string; dir: string}) {
  return `https://s3.amazonaws.com/${S3_BUCKET}/${S3_DIR_PREFIX}/${dir}/${filename}`;
}
