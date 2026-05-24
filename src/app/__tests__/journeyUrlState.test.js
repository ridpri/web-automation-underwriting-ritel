import test from "node:test";
import assert from "node:assert/strict";

import {
  normalizeJourneyOption,
  normalizeJourneyStep,
  readJourneyUrlStateFromUrl,
  writeJourneyUrlStateToUrl,
} from "../journeyUrlState.js";
import {
  clearSharedJourneyParamsFromUrl,
  normalizeJourneyEntryUrlFromUrl,
  normalizeProductReferralUrlFromUrl,
} from "../journeyAccess.js";

test("normalizes journey step inside configured range", () => {
  assert.equal(normalizeJourneyStep("2", { max: 3 }), 2);
  assert.equal(normalizeJourneyStep("9", { fallback: 1, max: 3 }), 1);
  assert.equal(normalizeJourneyStep("abc", { fallback: 1 }), 1);
});

test("normalizes options against allowed values", () => {
  assert.equal(normalizeJourneyOption("multi", { fallback: "single", validValues: ["single", "multi"] }), "multi");
  assert.equal(normalizeJourneyOption("legacy", { fallback: "single", validValues: ["single", "multi"] }), "single");
});

test("reads step mode and view from url", () => {
  const state = readJourneyUrlStateFromUrl("http://localhost/?journey=property-external&step=3&mode=multi&view=payment", {
    defaultMode: "single",
    validModes: ["single", "multi"],
    validViews: ["payment"],
  });
  assert.deepEqual(state, { step: 3, mode: "multi", view: "payment" });
});

test("writes state while preserving unrelated query params", () => {
  const url = writeJourneyUrlStateToUrl("http://localhost/?journey=property-external&role=guest", {
    step: 2,
    mode: "multi",
  }, {
    defaultMode: "single",
    validModes: ["single", "multi"],
  });
  assert.equal(url.searchParams.get("journey"), "property-external");
  assert.equal(url.searchParams.get("role"), "guest");
  assert.equal(url.searchParams.get("step"), "2");
  assert.equal(url.searchParams.get("mode"), "multi");
});

test("omits default step mode and empty view", () => {
  const url = writeJourneyUrlStateToUrl("http://localhost/?journey=motor-external&step=3&mode=multi&view=payment", {
    step: 1,
    mode: "single",
    view: "",
  }, {
    defaultMode: "single",
    validModes: ["single", "multi"],
    validViews: ["payment"],
  });
  assert.equal(url.searchParams.get("journey"), "motor-external");
  assert.equal(url.searchParams.has("step"), false);
  assert.equal(url.searchParams.has("mode"), false);
  assert.equal(url.searchParams.has("view"), false);
});

test("clears shared flow params without removing navigation identity", () => {
  const url = clearSharedJourneyParamsFromUrl(
    "http://localhost/?journey=motor-external&role=guest&step=3&mode=multi&view=payment&share=abc&offer=xyz&foo=bar",
  );

  assert.equal(url.searchParams.get("journey"), "motor-external");
  assert.equal(url.searchParams.get("role"), "guest");
  assert.equal(url.searchParams.get("foo"), "bar");
  ["step", "mode", "view", "share", "offer"].forEach((key) => {
    assert.equal(url.searchParams.has(key), false);
  });
});

test("normalizes internal workspace entry to dashboard", () => {
  const url = normalizeJourneyEntryUrlFromUrl(
    "http://localhost/promotion?journey=partner-config&role=internal&menu=promotion",
    "internal-workspace",
  );

  assert.equal(url.pathname, "/dashboard");
  assert.equal(url.searchParams.has("menu"), false);
  assert.equal(url.searchParams.get("journey"), "partner-config");
  assert.equal(url.searchParams.get("role"), "internal");
});

test("normalizes product referral token path to canonical product url", () => {
  const result = normalizeProductReferralUrlFromUrl(
    "https://esppa.asuransijasindo.co.id/product/kecelakaan-diri/728/46xs3?utm=wa#detail",
  );

  assert.equal(result.changed, true);
  assert.equal(result.referralToken, "46xs3");
  assert.equal(result.url.pathname, "/product/kecelakaan-diri/728/");
  assert.equal(result.url.searchParams.get("utm"), "wa");
  assert.equal(result.url.hash, "#detail");
});

test("keeps regular product urls unchanged", () => {
  const result = normalizeProductReferralUrlFromUrl(
    "https://esppa.asuransijasindo.co.id/product/kecelakaan-diri/728",
  );

  assert.equal(result.changed, false);
  assert.equal(result.referralToken, "");
  assert.equal(result.url.pathname, "/product/kecelakaan-diri/728");
});
