import test from "node:test";
import assert from "node:assert/strict";
import { paymentBlockMessage } from "./operatingLayer.js";

test("paymentBlockMessage", async (t) => {
  await t.test("returns empty string if record is falsy", () => {
    assert.equal(paymentBlockMessage(null), "");
    assert.equal(paymentBlockMessage(undefined), "");
  });

  await t.test("returns internal pending review message", () => {
    assert.equal(
      paymentBlockMessage({ status: "Pending Review Internal" }),
      "Status internal belum disetujui. Penawaran menunggu tindak lanjut tim internal sebelum bisa lanjut ke pembayaran."
    );
  });

  await t.test("returns revisi message", () => {
    assert.equal(
      paymentBlockMessage({ status: "Perlu Revisi" }),
      "Transaksi ini masih perlu revisi sebelum dapat dilanjutkan ke pembayaran."
    );
  });

  await t.test("returns rejected message", () => {
    assert.equal(
      paymentBlockMessage({ status: "Rejected" }),
      "Transaksi ini telah ditolak dan tidak dapat dilanjutkan ke pembayaran."
    );
  });

  await t.test("returns expired message", () => {
    assert.equal(
      paymentBlockMessage({ status: "Expired" }),
      "Versi transaksi ini sudah expired. Buat versi penawaran terbaru sebelum melanjutkan pembayaran."
    );
  });

  await t.test("returns not ready to pay message for various incomplete statuses", () => {
    const statuses = [
      "Draft",
      "Indikasi Terkirim",
      "Dibuka Calon Tertanggung",
      "Isi Data Lanjutan",
    ];
    for (const status of statuses) {
      assert.equal(
        paymentBlockMessage({ status }),
        "Transaksi ini belum siap bayar. Lengkapi atau review dahulu sebelum melanjutkan.",
        `Failed for status: ${status}`
      );
    }
  });

  await t.test("returns empty string for other statuses", () => {
    const statuses = ["Siap Bayar", "Pending Payment", "Paid", "UnknownStatus"];
    for (const status of statuses) {
      assert.equal(
        paymentBlockMessage({ status }),
        "",
        `Failed for status: ${status}`
      );
    }
  });
});
