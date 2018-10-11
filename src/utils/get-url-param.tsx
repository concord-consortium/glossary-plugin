export default function getURLParam(name: string): string | null {
  const url = (self || window).location.href;
  name = name.replace(/[[]]/g, "\\$&");
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);
  const results = regex.exec(url);
  if (!results) {
    return null;
  }
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}
