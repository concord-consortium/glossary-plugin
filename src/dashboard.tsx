import * as React from "react";
import * as ReactDOM from "react-dom";
import "whatwg-fetch";
import DashboardApp from "./components/dashboard/dashboard-app";
import { FIREBASE_APP, signInWithToken } from "./db";
import { getQueryParam, parseUrl } from "./utils/get-url-param";
import { IClassInfo } from "./types";

const getClassInfoUrl = () => getQueryParam("class");
const getOfferingInfoUrl = () => getQueryParam("offering");
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

// A comparison function to sort students by last and then first name
const compareStudentsByName = (
  student1: {lastName: string, firstName: string},
  student2: {lastName: string, firstName: string}
  ) => {
  const lastNameCompare = student1.lastName.toLocaleLowerCase().localeCompare(student2.lastName.toLocaleLowerCase());
  if (lastNameCompare !== 0) {
    return lastNameCompare;
  } else {
    return student1.firstName.localeCompare(student2.firstName);
  }
};

const init = async () => {
  const classUrl = getClassInfoUrl();
  const offeringUrl = getOfferingInfoUrl();
  if (!classUrl || !offeringUrl) {
    return initError();
  }
  const classInfoResponse = await fetch(classUrl, {headers: {Authorization: getAuthHeader()}});
  if (classInfoResponse.status === 400) {
    return alert("Your Portal session has expired. Please login to Portal and launch Glossary Dashboard again.");
  }
  if (!classInfoResponse.ok) {
    return alert("Portal API error. Please try to launch Glossary Dashboard again.");
  }
  const classInfoRaw = await classInfoResponse.json();
  const classInfo: IClassInfo = {
    source: parseUrl(classUrl).hostname,
    contextId: classInfoRaw.class_hash,
    students: classInfoRaw.students.map((s: any) => ({
      name: `${s.last_name}, ${s.first_name}`,
      firstName: s.first_name,
      lastName: s.last_name,
      id: s.user_id.toString()
    })).sort(compareStudentsByName)
  };
  const offeringInfoResponse = await fetch(offeringUrl, {headers: {Authorization: getAuthHeader()}});
  const offeringInfoRaw = await offeringInfoResponse.json();

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
      resourceUrl={offeringInfoRaw.activity_url}
    />
  , document.getElementById("app") as HTMLElement);
};

init();
