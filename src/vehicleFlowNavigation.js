import { readJourneyUrlState, replaceJourneyUrlState } from "./app/journeyUrlState.js";

export const VEHICLE_FLOW_URL_OPTIONS = {
  defaultStep: 1,
  defaultMode: "single",
  maxStep: 3,
  validModes: ["single", "multi"],
};

export function readVehicleFlowUrlState() {
  return readJourneyUrlState(VEHICLE_FLOW_URL_OPTIONS);
}

export function replaceVehicleFlowUrlState(state = {}) {
  return replaceJourneyUrlState(state, VEHICLE_FLOW_URL_OPTIONS);
}
