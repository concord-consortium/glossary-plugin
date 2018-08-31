import { initPlugin, GlossaryPlugin } from "./plugin";

describe("LARA plugin", () => {
  // Mock LARA API.
  const LARA = {
    register: jest.fn()
  };

  beforeEach(() => {
    (window as any).ExternalScripts = LARA;
  });

  it("loads without crashing and calls LARA.register", () => {
    initPlugin();
    expect(LARA.register).toBeCalledWith("glossary", GlossaryPlugin);
  });
});
