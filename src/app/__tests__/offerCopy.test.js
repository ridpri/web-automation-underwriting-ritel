import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getSharedOfferSummarySubtitle } from "../offerCopy.js";

describe("offer copy", () => {
  it("describes indicative shared offer summaries as prepared offers before the customer fills SPAU data", () => {
    const subtitle = getSharedOfferSummarySubtitle("Polis Standar Asuransi Kendaraan Bermotor Indonesia", "indicative");

    assert.match(subtitle, /data awal penawaran/i);
    assert.match(subtitle, /Data SPAU elektronik akan dilengkapi/i);
    assert.match(subtitle, /Polis Standar Asuransi Kendaraan Bermotor Indonesia/);
    assert.doesNotMatch(subtitle, /Anda isi dan lengkapi|kamu isi|telah.*isi/i);
  });

  it("describes final shared offer summaries as prepared data ready for customer review before payment", () => {
    const subtitle = getSharedOfferSummarySubtitle("Polis Standar Asuransi Kebakaran Indonesia", "final");

    assert.match(subtitle, /data penawaran dan SPAU elektronik/i);
    assert.match(subtitle, /ditinjau dan disetujui calon pemegang polis sebelum pembayaran/i);
    assert.match(subtitle, /Polis Standar Asuransi Kebakaran Indonesia/);
    assert.doesNotMatch(subtitle, /Data SPAU elektronik akan dilengkapi|langkah Data Lanjutan|Anda isi dan lengkapi|kamu isi/i);
  });
});
