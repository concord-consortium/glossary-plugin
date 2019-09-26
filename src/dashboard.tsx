import * as React from "react";
import * as ReactDOM from "react-dom";
import "whatwg-fetch";
import DashboardApp from "./components/dashboard/dashboard-app";
import { signInWithToken } from "./db";
import { getQueryParam } from "./utils/get-url-param";
import { IClassInfo } from "./types";

const FIREBASE_APP = "glossary-plugin";

const parseUrl = (url: string) => {
  const a = document.createElement("a");
  a.href = url;
  return a;
};

const getClassInfoUrl = () => getQueryParam("class");

const getAuthHeader = () => `Bearer ${getQueryParam("token")}`;

const getPortalBaseUrl = () => {
  const portalUrl = getClassInfoUrl();
  if (!portalUrl) {
    return null;
  }
  const { hostname, protocol } = parseUrl(portalUrl);
  return `${protocol}//${hostname}`;
};

const getPortalFirebaseJWTUrl = (classHash: string) => {
  const baseUrl = getPortalBaseUrl();
  if (!baseUrl) {
    return null;
  }
  return `${baseUrl}/api/v1/jwt/firebase?firebase_app=${FIREBASE_APP}&class_hash=${classHash}`;
};

const initError = () => {
  alert("Please launch Glossary Dashboard from Portal");
};

const init = async () => {
  const classUrl = getClassInfoUrl();
  if (!classUrl) {
    return initError();
  }
  const classInfoResponse = await fetch(classUrl, {headers: {Authorization: getAuthHeader()}});
  const classInfoRaw = await classInfoResponse.json();
  const classInfo: IClassInfo = {
    source: parseUrl(classUrl).hostname,
    contextId: classInfoRaw.class_hash,
    students: classInfoRaw.students.map((s: any) => ({
      name: `${s.first_name} ${s.last_name}`,
      id: s.user_id.toString()
    }))
  };

  const firebaseJWTUrl = getPortalFirebaseJWTUrl(classInfo.contextId);
  if (!firebaseJWTUrl) {
    return initError();
  }
  const firebaseJWTResponse = await fetch(firebaseJWTUrl, {headers: {Authorization: getAuthHeader()}});
  const firebaseJWTRaw = await firebaseJWTResponse.json();

  signInWithToken(firebaseJWTRaw.token);

  // Finally render Dashboard app.
  ReactDOM.render(
    <DashboardApp
      classInfo={classInfo}
    />
  , document.getElementById("app") as HTMLElement);
};

init();
