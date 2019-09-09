function getParam(name: string, type: string): string | null {
  const url = type === "?" ? window.location.search : window.location.hash;
  name = name.replace(/[[]]/g, "\\$&");
  const regex = new RegExp(`[${type}&]${name}(=([^&#]*)|&|#|$)`);
  const results = regex.exec(url);
  if (!results) {
    return null;
  }
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

export function getQueryParam(name: string): string | null {
  return getParam(name, "?");
}

export function getHashParam(name: string): string | null {
  return getParam(name, "#");
}
