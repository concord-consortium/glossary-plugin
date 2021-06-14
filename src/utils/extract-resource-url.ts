import { getQueryParam } from "./get-url-param";

// when the glossary dashboard is launched for any activity player activity
// the resource url needs to be pulled from the embedded query parameter and
// the api path and the json extension removed from it if it is an api url
// otherwise the full activity parameter should be used
export const extractResourceUrl = (url: string): string => {
  const activity = getQueryParam("activity", url) || "";
  const matches = activity.match(/^(.+)\/api\/v1\/activities\/(\d+)\.json$/);
  return matches ? `${matches[1]}/activities/${matches[2]}` : (activity || url);
};
