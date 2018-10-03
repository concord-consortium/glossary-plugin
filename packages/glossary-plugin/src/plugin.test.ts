import { initPlugin, GlossaryPlugin } from "./plugin";
import * as fetch from "jest-fetch-mock";
(global as any).fetch = fetch;

describe("LARA plugin initialization", () => {
  // Mock LARA API.
  const LARA = {
    registerPlugin: jest.fn(),
    decorateContent: jest.fn(),
    addSidebar: jest.fn()
  };

  beforeEach(() => {
    (window as any).LARA = LARA;
  });

  it("loads without crashing and calls LARA.register", () => {
    initPlugin();
    expect(LARA.registerPlugin).toBeCalledWith("glossary", GlossaryPlugin);
  });
});

describe("GlossaryPlugin", () => {
  it("renders PluginApp component", async () => {
    const context = {
      authoredState: "{}",
      learnerState: "",
      pluginId: "123",
      div: document.createElement("div")
    };
    const plugin = new GlossaryPlugin(context);
    // Note that this function doesn't have to be called manually in most cases. Constructor does it,
    // but it does not wait for it to complete (as it can't). So, we need to do it by hand while testing.
    await plugin.renderPluginApp();
    expect(plugin.pluginAppComponent).not.toBeUndefined();
  });

  it("provides reasonable fallback state if provided values are malformed", async () => {
    const context = {
      authoredState: "some old unsupported format",
      learnerState: "some old unsupported format",
      pluginId: "123",
      div: document.createElement("div")
    };
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

    const context = {
      authoredState: JSON.stringify({url: "http://test.url.com/state.json"}),
      learnerState: "",
      pluginId: "123",
      div: document.createElement("div")
    };

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
      expect(fetch).toHaveBeenCalledWith("http://test.url.com/state.json");
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
      expect(fetch).toHaveBeenCalledWith("http://test.url.com/state.json");
      expect(plugin.pluginAppComponent.props.definitions).toEqual([]);
      expect(plugin.pluginAppComponent.props.askForUserDefinition).toEqual(false);
    });
  });
});
