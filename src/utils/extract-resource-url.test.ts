import { extractResourceUrl } from "./extract-resource-url";

describe("extract-resource-url", () => {
  const activityUrl = "https://example.com/activities/123";
  const activityPlayerActivityUrl =
    "https://activity-player.concord.org/?activity=https%3A%2F%2Fexample.com%2Fapi%2Fv1%2Factivities%2F123.json";

  it("handles non activity player urls", () => {
    expect(extractResourceUrl(activityUrl)).toBe(activityUrl);
  });

  it("handles activity player urls", () => {
    expect(extractResourceUrl(activityPlayerActivityUrl)).toBe(activityUrl);
  });
});
