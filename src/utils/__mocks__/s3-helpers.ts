export const s3Upload = jest.fn(({ client, glossaryResource, filename }: any) => {
  return new Promise(resolve => {
    resolve(client.getPublicS3Url(glossaryResource, filename));
  });
});
