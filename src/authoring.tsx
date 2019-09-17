import * as React from "react";
import * as ReactDOM from "react-dom";
import AuthoringApp from "./components/authoring/authoring-app";
import authorizeInPortal from "./utils/authorize-in-portal";
import { Token } from "client-oauth2";
import { getHashParam, getQueryParam } from "./utils/get-url-param";

const portalUrl = getQueryParam("portal");
// Note that glossaryId can't be a query parameter, as it'd get sent to Portal as a part of the OAuth redirect URI.
// It would case Portal redirect uri verification to fail, as glossaryId is random and it'll vary all the time.
const glossaryId = getHashParam("glossaryId");

if (portalUrl) {
  // State will be defined only on the initial page load.
  const state = glossaryId ? JSON.stringify({ glossaryId }) : undefined;
  authorizeInPortal(portalUrl, state)
    .then((token: Token) => {
      // After we are redirected back from Portal, we need to reconstruct hash params from the state,
      // so authors can reload page without loosing reference to glossaryId.
      const passedState = token.data.state && JSON.parse(token.data.state);
      if (passedState.glossaryId) {
        const hash = `#glossaryId=${passedState.glossaryId}`;
        history.replaceState("", document.title, window.location.pathname + window.location.search + hash);
      }
      const getFirebaseJwt = (firebaseApp: string) => {
        const url = `${portalUrl}/api/v1/jwt/firebase?firebase_app=${firebaseApp}`;
        return fetch(url, {headers: {Authorization: `Bearer ${token.accessToken}`}})
          .then(response => response.json());
      };
      ReactDOM.render(
        <AuthoringApp
          getFirebaseJwt={getFirebaseJwt}
          standaloneAuthoring={{ glossaryResourceId: passedState.glossaryId }}
        />, document.getElementById("app") as HTMLElement);
    })
    .catch(error => {
      // tslint:disable-next-line:no-console
      console.error(error);
      alert(`Portal authorization failed\n\n ${error.message}`);
    });
} else {
  ReactDOM.render(<AuthoringApp />, document.getElementById("app") as HTMLElement);
}
