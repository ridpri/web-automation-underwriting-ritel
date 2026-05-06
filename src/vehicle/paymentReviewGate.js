export const CAR_COMP_CUSTOMER_PHOTO_REVIEW_PENDING_MESSAGE =
  "Foto kendaraan Mobil Comprehensive yang diunggah calon pemegang polis harus direview internal sebelum pembayaran.";

const INTERNAL_APPROVED_PAYMENT_STATUSES = new Set(["Siap Bayar", "Pending Payment", "Paid"]);
const INTERNAL_FINAL_SHARED_VIEWS = new Set(["offer-final", "payment"]);

export function isCarCompCustomerPhotoReviewApproved({
  flowType = "",
  entryMode = "",
  operatingStatus = "",
  sharedOfferEntryView = "",
} = {}) {
  if (flowType !== "carComp") return true;
  if (entryMode === "internal") return true;
  if (INTERNAL_APPROVED_PAYMENT_STATUSES.has(operatingStatus)) return true;
  if (INTERNAL_FINAL_SHARED_VIEWS.has(sharedOfferEntryView)) return true;
  return false;
}

export function getCarCompCustomerPhotoReviewPendingItems({
  flowType = "",
  entryMode = "",
  readyForNextStage = false,
  operatingStatus = "",
  sharedOfferEntryView = "",
} = {}) {
  if (!readyForNextStage) return [];
  if (isCarCompCustomerPhotoReviewApproved({ flowType, entryMode, operatingStatus, sharedOfferEntryView })) return [];
  return [CAR_COMP_CUSTOMER_PHOTO_REVIEW_PENDING_MESSAGE];
}
