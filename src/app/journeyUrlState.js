const DEFAULT_STEP = 1;

function parseUrl(urlInput) {
  if (urlInput instanceof URL) return new URL(urlInput.toString());
  if (typeof urlInput === "string") return new URL(urlInput, "http://localhost/");
  if (typeof window !== "undefined") return new URL(window.location.href);
  return new URL("http://localhost/");
}

export function normalizeJourneyStep(value, { fallback = DEFAULT_STEP, min = 1, max = 6 } = {}) {
  const numericValue = Number(value);
  if (!Number.isInteger(numericValue)) return fallback;
  if (numericValue < min || numericValue > max) return fallback;
  return numericValue;
}

export function normalizeJourneyOption(value, { fallback = "", validValues = [] } = {}) {
  if (!value) return fallback;
  if (!validValues.length) return value;
  return validValues.includes(value) ? value : fallback;
}

export function readJourneyUrlStateFromUrl(urlInput, options = {}) {
  const {
    defaultStep = DEFAULT_STEP,
    defaultMode = "",
    defaultView = "",
    maxStep = 6,
    minStep = 1,
    validModes = [],
    validViews = [],
  } = options;
  const url = parseUrl(urlInput);
  return {
    step: normalizeJourneyStep(url.searchParams.get("step"), {
      fallback: defaultStep,
      min: minStep,
      max: maxStep,
    }),
    mode: normalizeJourneyOption(url.searchParams.get("mode"), {
      fallback: defaultMode,
      validValues: validModes,
    }),
    view: normalizeJourneyOption(url.searchParams.get("view"), {
      fallback: defaultView,
      validValues: validViews,
    }),
  };
}

export function writeJourneyUrlStateToUrl(urlInput, state = {}, options = {}) {
  const {
    defaultStep = DEFAULT_STEP,
    defaultMode = "",
    defaultView = "",
    maxStep = 6,
    minStep = 1,
    omitDefaultValues = true,
    validModes = [],
    validViews = [],
  } = options;
  const url = parseUrl(urlInput);
  const nextStep = state.step === undefined
    ? readJourneyUrlStateFromUrl(url, options).step
    : normalizeJourneyStep(state.step, { fallback: defaultStep, min: minStep, max: maxStep });
  const nextMode = state.mode === undefined
    ? readJourneyUrlStateFromUrl(url, options).mode
    : normalizeJourneyOption(state.mode, { fallback: defaultMode, validValues: validModes });
  const nextView = state.view === undefined
    ? readJourneyUrlStateFromUrl(url, options).view
    : normalizeJourneyOption(state.view, { fallback: defaultView, validValues: validViews });

  if (omitDefaultValues && nextStep === defaultStep) url.searchParams.delete("step");
  else url.searchParams.set("step", String(nextStep));

  if (!nextMode || (omitDefaultValues && nextMode === defaultMode)) url.searchParams.delete("mode");
  else url.searchParams.set("mode", nextMode);

  if (!nextView || (omitDefaultValues && nextView === defaultView)) url.searchParams.delete("view");
  else url.searchParams.set("view", nextView);

  return url;
}

export function readJourneyUrlState(options = {}) {
  return readJourneyUrlStateFromUrl(undefined, options);
}

export function replaceJourneyUrlState(state = {}, options = {}) {
  if (typeof window === "undefined") return null;
  const nextUrl = writeJourneyUrlStateToUrl(window.location.href, state, options);
  window.history.replaceState({}, "", `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
  return nextUrl;
}
