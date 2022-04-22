import ensureCorrectProtocol from "./ensure-correct-protocol";

describe("ensureCorrectProtocol", () => {
  const win = {
    location: {
      protocol: "https:"
    }
  } as Window

  it("handles http urls and http windows", () => {
    win.location.protocol = "http:"
    expect(ensureCorrectProtocol("http://example.com/test", win)).toBe("http://example.com/test")
  })

  it("handles http urls and https windows", () => {
    win.location.protocol = "https:"
    expect(ensureCorrectProtocol("http://example.com/test", win)).toBe("https://example.com/test")
  })

  it("handles https urls and http windows", () => {
    win.location.protocol = "http:"
    expect(ensureCorrectProtocol("https://example.com/test", win)).toBe("https://example.com/test")
  })

  it("handles https urls and https windows", () => {
    win.location.protocol = "https:"
    expect(ensureCorrectProtocol("https://example.com/test", win)).toBe("https://example.com/test")
  })
})