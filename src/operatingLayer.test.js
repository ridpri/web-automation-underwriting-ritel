import { describe, it } from "node:test";
import assert from "node:assert";
import { paymentBlockMessage } from "./operatingLayer.js";

describe("paymentBlockMessage", () => {
  it("should return empty string when record is falsy", () => {
    assert.strictEqual(paymentBlockMessage(null), "");
    assert.strictEqual(paymentBlockMessage(undefined), "");
  });

  it("should return message for Pending Review Internal status", () => {
    const record = { status: "Pending Review Internal" };
    const expected = "Status internal belum disetujui. Penawaran menunggu tindak lanjut tim internal sebelum bisa lanjut ke pembayaran.";
    assert.strictEqual(paymentBlockMessage(record), expected);
  });

  it("should return message for Perlu Revisi status", () => {
    const record = { status: "Perlu Revisi" };
    const expected = "Transaksi ini masih perlu revisi sebelum dapat dilanjutkan ke pembayaran.";
    assert.strictEqual(paymentBlockMessage(record), expected);
  });

  it("should return message for Rejected status", () => {
    const record = { status: "Rejected" };
    const expected = "Transaksi ini telah ditolak dan tidak dapat dilanjutkan ke pembayaran.";
    assert.strictEqual(paymentBlockMessage(record), expected);
  });

  it("should return message for Expired status", () => {
    const record = { status: "Expired" };
    const expected = "Versi transaksi ini sudah expired. Buat versi penawaran terbaru sebelum melanjutkan pembayaran.";
    assert.strictEqual(paymentBlockMessage(record), expected);
  });

  it("should return message for early statuses (Draft, Indikasi Terkirim, Dibuka Calon Tertanggung, Isi Data Lanjutan)", () => {
    const expected = "Transaksi ini belum siap bayar. Lengkapi atau review dahulu sebelum melanjutkan.";
    assert.strictEqual(paymentBlockMessage({ status: "Draft" }), expected);
    assert.strictEqual(paymentBlockMessage({ status: "Indikasi Terkirim" }), expected);
    assert.strictEqual(paymentBlockMessage({ status: "Dibuka Calon Tertanggung" }), expected);
    assert.strictEqual(paymentBlockMessage({ status: "Isi Data Lanjutan" }), expected);
  });

  it("should return empty string for unhandled/payable statuses (e.g. Siap Bayar, Pending Payment, Paid)", () => {
    assert.strictEqual(paymentBlockMessage({ status: "Siap Bayar" }), "");
    assert.strictEqual(paymentBlockMessage({ status: "Pending Payment" }), "");
    assert.strictEqual(paymentBlockMessage({ status: "Paid" }), "");
    assert.strictEqual(paymentBlockMessage({ status: "Unknown Status" }), "");
  });
});
