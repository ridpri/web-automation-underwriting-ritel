import { test } from "node:test";
import assert from "node:assert";
import { statusTone } from "./operatingLayer.js";

test("statusTone returns 'slate' for falsy values", () => {
  assert.strictEqual(statusTone(), "slate");
  assert.strictEqual(statusTone(null), "slate");
  assert.strictEqual(statusTone(undefined), "slate");
  assert.strictEqual(statusTone(""), "slate");
});

test("statusTone returns 'slate' for 'Draft'", () => {
  assert.strictEqual(statusTone("Draft"), "slate");
});

test("statusTone returns 'orange' for 'Siap Bayar' or 'Pending Payment'", () => {
  assert.strictEqual(statusTone("Siap Bayar"), "orange");
  assert.strictEqual(statusTone("Pending Payment"), "orange");
});

test("statusTone returns 'emerald' for 'Paid' or 'Selesai'", () => {
  assert.strictEqual(statusTone("Paid"), "emerald");
  assert.strictEqual(statusTone("Selesai"), "emerald");
});

test("statusTone returns 'amber' for 'Pending Review Internal' or 'Perlu Revisi'", () => {
  assert.strictEqual(statusTone("Pending Review Internal"), "amber");
  assert.strictEqual(statusTone("Perlu Revisi"), "amber");
});

test("statusTone returns 'red' for 'Rejected' or 'Expired'", () => {
  assert.strictEqual(statusTone("Rejected"), "red");
  assert.strictEqual(statusTone("Expired"), "red");
});

test("statusTone returns 'blue' for 'Indikasi Terkirim', 'Dibuka Calon Tertanggung', or 'Isi Data Lanjutan'", () => {
  assert.strictEqual(statusTone("Indikasi Terkirim"), "blue");
  assert.strictEqual(statusTone("Dibuka Calon Tertanggung"), "blue");
  assert.strictEqual(statusTone("Isi Data Lanjutan"), "blue");
});

test("statusTone returns 'slate' for unrecognized statuses", () => {
  assert.strictEqual(statusTone("Unknown Status"), "slate");
  assert.strictEqual(statusTone("Some Other Status"), "slate");
});
