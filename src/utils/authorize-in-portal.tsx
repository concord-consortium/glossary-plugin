import { getHashParam, getQueryParam } from "./get-url-param";
import * as ClientOAuth2 from "client-oauth2";

// Portal has to have AuthClient configured with this clientId.
const CLIENT_ID = "glossary-plugin";
const AUTH_PATH = "/auth/oauth_authorize";

export default function authorizeInPortal(portalURL: string): Promise<ClientOAuth2.Token> {
  const portalAuth = new ClientOAuth2({
    clientId: CLIENT_ID,
    // Make development easier. Note that if you're using custom Portal using query param,
    // this query param will have to part of the redirect URI registered in Portal. E.g. for local env:
    // "http://localhost:8080/authoring.html?portal=http://app.rigse.docker"
    redirectUri: window.location.href,
    authorizationUri: `${portalURL}${AUTH_PATH}`
  });

  if (getHashParam("access_token") || getHashParam("error")) {
    // We're coming back from Portal with access_token or error.
    return portalAuth.token.getToken(window.location.href)
      .then((token) => {
        // Remove fragment that includes access token and other data coming from server to make leak a bit less likely.
        history.pushState("", document.title, window.location.pathname + window.location.search);
        return token;
      });
  } else if (getQueryParam("code")) {
    // We're coming back from Portal that doesn't support implicit flow.
    // Throw an error to avoid infinite loop of redirects.
    return new Promise((resolve, reject) => {
      reject(new Error("Selected Portal does not support OAuth2 implicit flow. Please use another Portal."));
    });
  } else {
    // Initial page load, no info from Portal (either access token or error). Redirect to Portal to get authorization.
    window.location.href = portalAuth.token.getUri();
    return new Promise(() => {
      // just to make TS happy about types return Promise. It doesn't matter as we're redirecting to Portal anyway.
    });
  }
}
