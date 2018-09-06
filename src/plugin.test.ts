import { initPlugin, GlossaryPlugin } from "./plugin";

describe("LARA plugin", () => {
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
