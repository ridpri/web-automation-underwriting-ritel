import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getCanonicalPathForJourney, resolveRouteFromPath, shouldKeepRoleQuery } from "../routing.js";

describe("app routing", () => {
  it("resolves clean internal and external entry paths", () => {
    assert.deepEqual(resolveRouteFromPath("/internal/property"), {
      path: "/internal/property",
      journey: "property-internal",
      sessionRole: "internal",
    });
    assert.deepEqual(resolveRouteFromPath("/external/property"), {
      path: "/external/property",
      journey: "property-external",
      sessionRole: "external",
    });
    assert.deepEqual(resolveRouteFromPath("/guest/property"), {
      path: "/guest/property",
      journey: "property-external",
      sessionRole: "guest",
    });
  });

  it("keeps shared offer URLs on offer paths", () => {
    const params = new URLSearchParams("view=offer-indicative&offer=%7B%7D");

    assert.equal(getCanonicalPathForJourney("property-external", "guest", params), "/offer/property");
    assert.equal(getCanonicalPathForJourney("property-all-risk-external", "guest", params), "/offer/property-all-risk");
  });

  it("returns role-specific canonical paths for the same journey", () => {
    assert.equal(getCanonicalPathForJourney("property-external", "guest"), "/guest/property");
    assert.equal(getCanonicalPathForJourney("property-external", "external"), "/external/property");
    assert.equal(getCanonicalPathForJourney("internal-workspace", "internal"), "/workspace");
  });

  it("removes role query when the path already encodes the role", () => {
    assert.equal(shouldKeepRoleQuery("internal", "/internal/property"), false);
    assert.equal(shouldKeepRoleQuery("external", "/external/property"), false);
    assert.equal(shouldKeepRoleQuery("partner", "/external/property"), true);
  });
});
