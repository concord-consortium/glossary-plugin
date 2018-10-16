import * as AWS from "aws-sdk";

const S3_BUCKET = "models-resources";
const S3_DIR_PREFIX = "glossary-resources";
const S3_REGION = "us-east-1";
const CLOUDFRONT_URL = "https://models-resources.concord.org";
const CLOUDFRONT_DISTRIBUTION = "E1QHTGVGYD1DWZ";

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
    const key = `${S3_DIR_PREFIX}/${dir}/${filename}`;
    s3.upload({
      Bucket: S3_BUCKET,
      Key: key,
      Body: body,
      ACL: "public-read",
      ContentType: contentType
    }, (err: Error, data: AWS.S3.ManagedUpload.SendData) => {
      if (err) {
        reject(err.message);
      } else {
        // Construct custom Cloudfront URL instead of the direct S3 URL.
        resolve(`${CLOUDFRONT_URL}/${data.Key}`);
      }
    });
    // Invalidate Cloudfront path too.
    const cf = new AWS.CloudFront({
      accessKeyId: accessKey,
      secretAccessKey: secretKey
    });
    cf.createInvalidation({
      DistributionId: CLOUDFRONT_DISTRIBUTION,
      InvalidationBatch: {
        CallerReference: new Date().getTime().toString(),
        Paths: {
          Quantity: 1,
          Items: [
            "/" + key
          ]
        }
      }
    }, (err) => {
      if (err) {
        // Invalidation problem (unlikely) doesn't seem to be so important to fail the whole saving process.
        // Just log an error.
        // tslint:disable-next-line:no-console
        console.error("Cloudfront invalidation failed", err);
      }
    });
  });
}

// In fact it returns Cloudfront URL pointing to a given object in S3 bucket.
export function s3Url({ filename, dir }: { filename: string; dir: string}) {
  return `${CLOUDFRONT_URL}/${S3_DIR_PREFIX}/${dir}/${filename}`;
}
