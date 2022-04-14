const params = new URLSearchParams(window.location.search);
const debugJson = params.has("debugJson") === true;
const saveInDemo = params.has("saveInDemo") === true;

export { debugJson, saveInDemo };