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
    assert.deepEqual(resolveRouteFromPath("/external/car-comprehensive"), {
      path: "/external/car-comprehensive",
      journey: "mobil-comp",
      sessionRole: "external",
    });
    assert.deepEqual(resolveRouteFromPath("/guest/car-comprehensive"), {
      path: "/guest/car-comprehensive",
      journey: "mobil-comp",
      sessionRole: "guest",
    });
  });

  it("keeps shared offer URLs on offer paths", () => {
    const params = new URLSearchParams("view=offer-indicative&offer=%7B%7D");
    const finalParams = new URLSearchParams("view=offer-final&share=token");

    assert.equal(getCanonicalPathForJourney("property-external", "guest", params), "/offer/property");
    assert.equal(getCanonicalPathForJourney("property-all-risk-external", "guest", params), "/offer/property-all-risk");
    assert.equal(getCanonicalPathForJourney("motor-external", "guest", params), "/offer/motor");
    assert.equal(getCanonicalPathForJourney("car-tlo-external", "guest", params), "/offer/car-tlo");
    assert.equal(getCanonicalPathForJourney("mobil-comp", "guest", params), "/offer/car-comprehensive");
    assert.equal(getCanonicalPathForJourney("motor-external", "guest", finalParams), "/offer/motor");
    assert.equal(getCanonicalPathForJourney("car-tlo-external", "guest", finalParams), "/offer/car-tlo");
    assert.equal(getCanonicalPathForJourney("mobil-comp", "guest", finalParams), "/offer/car-comprehensive");
  });

  it("returns role-specific canonical paths for the same journey", () => {
    assert.equal(getCanonicalPathForJourney("property-external", "guest"), "/guest/property");
    assert.equal(getCanonicalPathForJourney("property-external", "external"), "/external/property");
    assert.equal(getCanonicalPathForJourney("mobil-comp", "guest"), "/guest/car-comprehensive");
    assert.equal(getCanonicalPathForJourney("mobil-comp", "external"), "/external/car-comprehensive");
    assert.equal(getCanonicalPathForJourney("internal-workspace", "internal"), "/workspace");
  });

  it("removes role query when the path already encodes the role", () => {
    assert.equal(shouldKeepRoleQuery("internal", "/internal/property"), false);
    assert.equal(shouldKeepRoleQuery("external", "/external/property"), false);
    assert.equal(shouldKeepRoleQuery("partner", "/external/property"), true);
  });
});
