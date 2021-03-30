import { extractResourceUrl } from "./extract-resource-url";

describe("extract-resource-url", () => {
  const activityUrl = "https://example.com/activities/123";
  const activityPlayerActivityUrl =
    "https://activity-player.concord.org/?activity=https%3A%2F%2Fexample.com%2Factivities%2F123";
  const activityPlayerActivityApiUrl =
    "https://activity-player.concord.org/?activity=https%3A%2F%2Fexample.com%2Fapi%2Fv1%2Factivities%2F123.json";
  const activityPlayerAnyActivityUrl =
    "https://activity-player.concord.org/?activity=foo";
  const activityPlayerFooUrl =
    "https://activity-player.concord.org/?foo=bar";

  it("handles non activity player urls", () => {
    expect(extractResourceUrl(activityUrl)).toBe(activityUrl);
    expect(extractResourceUrl(activityPlayerFooUrl)).toBe(activityPlayerFooUrl);
  });

  it("handles activity player urls with api urls", () => {
    expect(extractResourceUrl(activityPlayerActivityApiUrl)).toBe(activityUrl);
  });

  it("handles activity player urls with non-api urls", () => {
    expect(extractResourceUrl(activityPlayerActivityUrl)).toBe(activityUrl);
    expect(extractResourceUrl(activityPlayerAnyActivityUrl)).toBe("foo");
  });
});
