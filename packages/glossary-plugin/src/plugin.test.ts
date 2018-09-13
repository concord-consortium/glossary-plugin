import { initPlugin, GlossaryPlugin } from "./plugin";

describe("LARA plugin initialization", () => {
  // Mock LARA API.
  const LARA = {
    registerPlugin: jest.fn()
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
  it("renders PluginApp component", () => {
    const context = {
      authoredState: "{}",
      learnerState: "",
      pluginId: "123",
      div: document.createElement("div")
    };
    document.body.appendChild(context.div);
    const plugin = new GlossaryPlugin(context);

    expect(plugin.pluginAppComponent).not.toBeNull();
  });
});
