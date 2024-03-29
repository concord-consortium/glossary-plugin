import { initPlugin, GlossaryPlugin, GlossaryAuthoringPlugin } from "./plugin";
import * as fetch from "jest-fetch-mock";
(global as any).fetch = fetch;
import * as PluginAPI from "@concord-consortium/lara-plugin-api";
import {ILogData} from "@concord-consortium/lara-plugin-api";
import { signInWithToken } from "./db";

jest.mock("@concord-consortium/lara-plugin-api");
jest.mock("./db");

(PluginAPI.events as any) = {
  onPluginSyncRequest: jest.fn()
};

describe("LARA plugin initialization", () => {
  it("loads without crashing and calls LARA.register", () => {
    initPlugin();
    expect(PluginAPI.registerPlugin).toBeCalledWith({
      runtimeClass: GlossaryPlugin,
      authoringClass: GlossaryAuthoringPlugin
    });
  });
});

describe("GlossaryPlugin", () => {
  const defaultContext: PluginAPI.IPluginRuntimeContext = {
    name: "test",
    url: "http://123.com",
    runId: 123,
    remoteEndpoint: null,
    userEmail: null,
    saveLearnerPluginState: (state: string) => new Promise<string>(() => null),
    getClassInfo: () => null,
    getFirebaseJwt: (appName: string) => new Promise<PluginAPI.IJwtResponse>((resolve, reject) => reject(null)),
    authoredState: null,
    learnerState: null,
    pluginId: 123,
    container: document.createElement("div"),
    wrappedEmbeddable: null,
    log: (logData: string | ILogData) => { /** null */ },
    resourceUrl: "http://activity.com/123",
    offlineMode: false
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("renders PluginApp component", async () => {
    const plugin = new GlossaryPlugin(defaultContext);
    // Note that this function doesn't have to be called manually in most cases. Constructor does it,
    // but it does not wait for it to complete (as it can't). So, we need to do it by hand while testing.
    await plugin.renderPluginApp();
    expect(plugin.pluginAppComponent).not.toBeUndefined();
    expect(PluginAPI.events.onPluginSyncRequest).toBeCalled();
  });

  it("provides reasonable fallback state if provided values are malformed", async () => {
    const context = Object.assign({}, defaultContext, {authoredState: "foo", learnerState: "bar"});
    const plugin = new GlossaryPlugin(context);
    // Note that this function doesn't have to be called manually in most cases. Constructor does it,
    // but it does not wait for it to complete (as it can't). So, we need to do it by hand while testing.
    await plugin.renderPluginApp();
    expect(plugin.pluginAppComponent.props.definitions).toEqual([]);
    expect(plugin.pluginAppComponent.props.askForUserDefinition).toEqual(false);
    expect(plugin.pluginAppComponent.props.initialLearnerState).toEqual({ definitions: {} });
  });

  describe("when authored state contains `url` property", () => {
    beforeEach(() => {
      fetch.resetMocks();
    });

    const context = Object.assign({}, defaultContext, {
      authoredState: JSON.stringify({s3Url: "http://test.url.com/state.json"})
    });

    it("fetches JSON at this URL and uses it as an authored state", async () => {
      const definitions = [{word: "test1", definition: "test 1"}];
      fetch.mockResponse(JSON.stringify({
        definitions,
        askForUserDefinition: true,
      }));
      const plugin = new GlossaryPlugin(context);
      // Note that this function doesn't have to be called manually in most cases. Constructor does it,
      // but it does not wait for it to complete (as it can't). So, we need to do it by hand while testing.
      // Also, it means that this function is being called twice - once by constructor and once here.
      // But it's designed to be idempotent, so that's fine.
      await plugin.renderPluginApp();
      expect(fetch).toHaveBeenCalledWith("https://test.url.com/state.json");
      expect(plugin.pluginAppComponent.props.definitions).toEqual(definitions);
      expect(plugin.pluginAppComponent.props.askForUserDefinition).toEqual(true);
    });

    it("it provides default authored state if response at given URL is malformed", async () => {
      fetch.mockResponse("malformed response, maybe 404 error");
      const plugin = new GlossaryPlugin(context);
      // Note that this function doesn't have to be called manually in most cases. Constructor does it,
      // but it does not wait for it to complete (as it can't). So, we need to do it by hand while testing.
      // Also, it means that this function is being called twice - once by constructor and once here.
      // But it's designed to be idempotent, so that's fine.
      await plugin.renderPluginApp();
      expect(fetch).toHaveBeenCalledWith("https://test.url.com/state.json");
      expect(plugin.pluginAppComponent.props.definitions).toEqual([]);
      expect(plugin.pluginAppComponent.props.askForUserDefinition).toEqual(false);
    });
  });

  describe("when firebaseJWT is available", () => {
    it("signs in to Firestore and passes down student info", async () => {
      const jwtResp = {
        token: "token123",
        claims: {
          domain: "http://test.portal.concord.org",
          claims: {
            class_hash: "class123",
            platform_user_id: 123
          }
        }
      };
      const context = Object.assign({}, defaultContext, {
        remoteEndpoint: "endpoint",
        getFirebaseJwt: (appName: string) => new Promise<PluginAPI.IJwtResponse>((resolve) => resolve(jwtResp as any))
      });
      const plugin = new GlossaryPlugin(context);
      await plugin.renderPluginApp();
      expect(signInWithToken).toHaveBeenCalledWith(jwtResp.token);
      expect(plugin.pluginAppComponent.props.studentInfo).toEqual({
        source: "test.portal.concord.org",
        contextId: "class123",
        userId: "123"
      });
    });
  });

  describe("when firebaseJWT is not available", () => {
    it("passes `undefined` as student info", async () => {
      const plugin = new GlossaryPlugin(defaultContext);
      await plugin.renderPluginApp();
      expect(signInWithToken).not.toHaveBeenCalled();
      expect(plugin.pluginAppComponent.props.studentInfo).toEqual(undefined);
    });
  });
});
