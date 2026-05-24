import test from "node:test";
import assert from "node:assert/strict";

import { VEHICLE_FLOW_URL_OPTIONS } from "../vehicleFlowNavigation.js";

test("vehicle flow url options persist the three customer journey steps", () => {
  assert.equal(VEHICLE_FLOW_URL_OPTIONS.defaultStep, 1);
  assert.equal(VEHICLE_FLOW_URL_OPTIONS.maxStep, 3);
});
