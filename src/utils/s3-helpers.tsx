import * as AWS from "aws-sdk";
import * as AmazonS3URI from "amazon-s3-uri";

export function s3Upload({ url, accessKey, secretKey, body, contentType = "" }:
                         { url: string, accessKey: string, secretKey: string, body: string, contentType?: string }) {
  return new Promise((resolve, reject) => {
    const { region, bucket, key } = AmazonS3URI(url);
    const s3 = new AWS.S3({
      region,
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    });
    s3.upload({
      Bucket: bucket,
      Key: key,
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
