import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createEmptyDocumentCheck } from "./securityControls.js";

describe("createEmptyDocumentCheck", () => {
  it("should return the expected default object structure when called with a valid docType", () => {
    const docType = "KTP";
    const result = createEmptyDocumentCheck(docType);

    assert.deepEqual(result, {
      docType: "KTP",
      status: "idle",
      confidence: null,
      mismatchFields: [],
      duplicate: false,
      requiresVerification: false,
      requiresReview: false,
      manualReviewReason: "",
      extractedAt: "",
      extractedData: {},
    });
  });

  it("should handle an undefined docType gracefully", () => {
    const result = createEmptyDocumentCheck(undefined);

    assert.deepEqual(result, {
      docType: undefined,
      status: "idle",
      confidence: null,
      mismatchFields: [],
      duplicate: false,
      requiresVerification: false,
      requiresReview: false,
      manualReviewReason: "",
      extractedAt: "",
      extractedData: {},
    });
  });

  it("should set docType correctly for different strings", () => {
    const result = createEmptyDocumentCheck("NPWP");
    assert.strictEqual(result.docType, "NPWP");
    assert.strictEqual(result.status, "idle");
  });
});
