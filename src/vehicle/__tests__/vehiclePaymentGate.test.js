import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  CAR_COMP_CUSTOMER_PHOTO_REVIEW_PENDING_MESSAGE,
  getCarCompCustomerPhotoReviewPendingItems,
} from "../paymentReviewGate.js";

describe("vehicle payment review gate", () => {
  it("blocks customer-filled car comprehensive data from payment until internal photo review", () => {
    const result = getCarCompCustomerPhotoReviewPendingItems({
      flowType: "carComp",
      entryMode: "external",
      readyForNextStage: true,
    });

    assert.deepEqual(result, [CAR_COMP_CUSTOMER_PHOTO_REVIEW_PENDING_MESSAGE]);
  });

  it("does not show the photo review gate before the base data is complete", () => {
    const result = getCarCompCustomerPhotoReviewPendingItems({
      flowType: "carComp",
      entryMode: "external",
      readyForNextStage: false,
    });

    assert.deepEqual(result, []);
  });

  it("allows car comprehensive payment after internal approval or final internal offer", () => {
    assert.deepEqual(
      getCarCompCustomerPhotoReviewPendingItems({
        flowType: "carComp",
        entryMode: "external",
        readyForNextStage: true,
        operatingStatus: "Siap Bayar",
      }),
      [],
    );
    assert.deepEqual(
      getCarCompCustomerPhotoReviewPendingItems({
        flowType: "carComp",
        entryMode: "external",
        readyForNextStage: true,
        sharedOfferEntryView: "offer-final",
      }),
      [],
    );
  });

  it("does not apply the customer photo review gate to other vehicle products", () => {
    const result = getCarCompCustomerPhotoReviewPendingItems({
      flowType: "carTlo",
      entryMode: "external",
      readyForNextStage: true,
    });

    assert.deepEqual(result, []);
  });
});
