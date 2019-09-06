import { getHashParam, getQueryParam } from "./get-url-param";
import * as ClientOAuth2 from "client-oauth2";

// Portal has to have AuthClient configured with this clientId.
const CLIENT_ID = "glossary-plugin";
const DEFAULT_PORTAL = "https://learn.concord.org";

export default function authorizeInPortal(): Promise<ClientOAuth2.Token> {
  const portalURL = getQueryParam("portal") || DEFAULT_PORTAL;
  const portalAuth = new ClientOAuth2({
    clientId: CLIENT_ID,
    // Make development easier. Note that if you're using custom Portal using query param,
    // this query param will have to part of the redirect URI registered in Portal. E.g. for local env:
    // "http://localhost:8080/authoring.html?portal=http://app.rigse.docker"
    redirectUri: window.location.href,
    authorizationUri: `${portalURL}/auth/oauth_authorize`
  });

  if (!getHashParam("access_token") && !getHashParam("error")) {
    // Initial page load, no info from Portal (either access token or error). Redirect to Portal to get authorization.
    window.location.href = portalAuth.token.getUri();
    return new Promise(() => {
      // just to make TS happy about types return Promise. It doesn't matter as we're redirecting to Portal anyway.
    });
  } else {
    // We're coming back from portal with access_token or error.
    return portalAuth.token.getToken(window.location.href)
      .then((token) => {
        // Remove fragment that includes access token and other data coming from server to make leak a bit less likely.
        history.pushState("", document.title, window.location.pathname + window.location.search);
        return token;
      });
  }
}
