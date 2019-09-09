import authorizeInPortal from "./authorize-in-portal";

describe("authorizeInPortal", () => {
  beforeEach(() => {
    // JSDom doesn't support navigation. Use simpler approach to test it.
    delete (global as any).window.location;
  });
  describe("when access_token or error params are not available", () => {
    beforeEach(() => {
      (global as any).window.location = new URL("http://test.glossary.com?portal=https://test.portal.com");
    });

    it("should redirect to Portal", () => {
      authorizeInPortal();
      expect(window.location.href).toEqual(
        "https://test.portal.com/auth/oauth_authorize?client_id=glossary-plugin&" +
        "redirect_uri=http%3A%2F%2Ftest.glossary.com%2F%3Fportal%3Dhttps%3A%2F%2Ftest.portal.com&" +
        "scope=&response_type=token&state="
      );
    });
  });

  describe("when access_token is provided", () => {
    beforeEach(() => {
      (global as any).window.location = new URL(
        "http://test.glossary.com?portal=https://test.portal.com#access_token=123&token_type=bearer"
      );
    });

    it("should resolve and provide token info", async () => {
      const token = await authorizeInPortal();
      expect(token.accessToken).toEqual("123");
      expect(token.tokenType).toEqual("bearer");
    });
  });

  describe("when error is provided", () => {
    beforeEach(() => {
      (global as any).window.location = new URL(
        "http://test.glossary.com?portal=https://test.portal.com#error=invalid_grant"
      );
    });

    it("should throw an error", async () => {
      try {
        await authorizeInPortal();
      } catch (e) {
        expect(e.message).toEqual(
          "The provided authorization grant (e.g., authorization code, resource owner credentials) or refresh " +
          "token is invalid, expired, revoked, does not match the redirection URI used in the authorization " +
          "request, or was issued to another client."
        );
      }
    });
  });
});
