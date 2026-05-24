import test from "node:test";
import assert from "node:assert/strict";

import { PROPERTY_FLOW_URL_OPTIONS, resolveExternalPropertyBackTarget, resolveExternalPropertyEditExtensionsTarget } from "../propertyFlowNavigation.js";

test("property flow url options keep step mode and known external views", () => {
  assert.equal(PROPERTY_FLOW_URL_OPTIONS.defaultStep, 1);
  assert.equal(PROPERTY_FLOW_URL_OPTIONS.defaultMode, "single");
  assert.equal(PROPERTY_FLOW_URL_OPTIONS.validModes.includes("multi"), true);
  assert.equal(PROPERTY_FLOW_URL_OPTIONS.validViews.includes("payment"), true);
});

test("external property payment back returns to data form", () => {
  assert.equal(resolveExternalPropertyBackTarget({ currentView: "payment", hasSharedOffer: false }), "external-underwriting");
});

test("external property data form back returns to simulation for logged-in direct journey", () => {
  assert.equal(resolveExternalPropertyBackTarget({ currentView: "external-underwriting", hasSharedOffer: false }), "");
});

test("external property data form back returns to offer review only for shared offer journey", () => {
  assert.equal(resolveExternalPropertyBackTarget({ currentView: "external-underwriting", hasSharedOffer: true }), "offer-indicative");
});

test("external property final offer back uses offer review only when there is shared offer context", () => {
  assert.equal(resolveExternalPropertyBackTarget({ currentView: "offer-final", hasSharedOffer: true }), "offer-indicative");
  assert.equal(resolveExternalPropertyBackTarget({ currentView: "offer-final", hasSharedOffer: false }), "");
});

test("external property edit extensions from payment returns to step one for direct journey", () => {
  assert.deepEqual(resolveExternalPropertyEditExtensionsTarget({ hasSharedOffer: false }), { view: "", step: 1 });
});

test("external property edit extensions from shared payment returns to offer review step one", () => {
  assert.deepEqual(resolveExternalPropertyEditExtensionsTarget({ hasSharedOffer: true }), { view: "offer-indicative", step: 1 });
});
