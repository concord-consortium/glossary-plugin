import * as React from "react";
import * as ReactDOM from "react-dom";
import AuthoringApp from "./components/authoring/authoring-app";
import authorizeInPortal from "./utils/authorize-in-portal";
import { Token } from "client-oauth2";
import { getQueryParam } from "./utils/get-url-param";

const portalURL = getQueryParam("portal");

if (portalURL) {
  authorizeInPortal(portalURL)
    .then((token: Token) => {
      ReactDOM.render(<AuthoringApp accessToken={token.accessToken} />, document.getElementById("app") as HTMLElement);
    })
    .catch(error => {
      // tslint:disable-next-line:no-console
      console.error(error);
      alert(`Portal authorization failed\n\n ${error.message}`);
    });
} else {
  ReactDOM.render(<AuthoringApp />, document.getElementById("app") as HTMLElement);
}
