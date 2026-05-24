import { readJourneyUrlState, replaceJourneyUrlState } from "../app/journeyUrlState.js";

export const PROPERTY_FLOW_URL_OPTIONS = {
  defaultStep: 1,
  defaultMode: "single",
  validModes: ["single", "multi"],
  validViews: ["offer-indicative", "offer-final", "external-underwriting", "payment"],
  maxStep: 3,
};

export function readPropertyFlowUrlState() {
  return readJourneyUrlState(PROPERTY_FLOW_URL_OPTIONS);
}

export function replacePropertyFlowUrlState(state = {}) {
  return replaceJourneyUrlState(state, PROPERTY_FLOW_URL_OPTIONS);
}

export function resolveExternalPropertyBackTarget({ currentView = "", hasSharedOffer = false } = {}) {
  if (currentView === "payment") return "external-underwriting";
  if (currentView === "external-underwriting") return hasSharedOffer ? "offer-indicative" : "";
  if (currentView === "offer-final") return hasSharedOffer ? "offer-indicative" : "";
  return "";
}

export function resolveExternalPropertyEditExtensionsTarget({ hasSharedOffer = false } = {}) {
  return {
    view: hasSharedOffer ? "offer-indicative" : "",
    step: 1,
  };
}
