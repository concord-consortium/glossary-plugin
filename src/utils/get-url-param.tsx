function getParam(name: string, type: string, url?: string): string | null {
  url = url || (type === "?" ? window.location.search : window.location.hash);
  name = name.replace(/[[]]/g, "\\$&");
  const regex = new RegExp(`[${type}&]${name}(=([^&#]*)|&|#|$)`);
  const results = regex.exec(url);
  if (!results) {
    return null;
  }
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

export const GLOSSARY_URL_PARAM = "glossaryUrl";
export function getQueryParam(name: string, url?: string): string | null {
  return getParam(name, "?", url);
}

export function getHashParam(name: string): string | null {
  return getParam(name, "#");
}

export function parseUrl(url: string) {
  const a = document.createElement("a");
  a.href = url;
  return a;
}
