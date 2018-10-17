export const S3_DIR_PREFIX = "test-resources";
export const CLOUDFRONT_URL = "https://test-resources.mock.concord.org";

export const s3Upload = jest.fn(({ dir, filename }: any) => {
  const key = `${S3_DIR_PREFIX}/${dir}/${filename}`;
  return new Promise(resolve => {
    resolve(`${CLOUDFRONT_URL}/${key}`);
  });
});

export const s3Url = jest.fn(({ filename, dir }: { filename: string; dir: string; }) => {
  return `${CLOUDFRONT_URL}/${S3_DIR_PREFIX}/${dir}/${filename}`;
});
