import test from "node:test";
import assert from "node:assert/strict";

import { buildInternalWorkspaceSummary, getInternalPortalMenus, getTaskListRecords } from "../../workspacePortalModel.js";

const SAMPLE_RECORDS = [
  {
    id: "TRX-001",
    status: "Pending Review Internal",
    validUntil: "30 Juni 2026",
  },
  {
    id: "TRX-002",
    status: "Isi Data Lanjutan",
    validUntil: "30 Juni 2026",
  },
  {
    id: "TRX-003",
    status: "Siap Bayar",
    validUntil: "15 Mei 2026",
  },
  {
    id: "TRX-004",
    status: "Paid",
    validUntil: "30 Juni 2026",
  },
];

const EXPIRY_AWARE_RECORDS = [
  ...SAMPLE_RECORDS,
  {
    id: "TRX-005",
    status: "Siap Bayar",
    validUntil: "30 Juni 2026",
  },
];

const NOW = new Date("2026-06-01T09:00:00+07:00");
const SNAPSHOT_NOW = new Date("2026-05-10T09:00:00+07:00");

test("internal portal menu matches updated ordering", () => {
  const labels = getInternalPortalMenus().map((item) => item.label);

  assert.deepEqual(labels, ["Dashboard", "Task List", "Review Queue", "Semua Transaksi", "Partner Config"]);
});

test("workspace summary counts review, action, and completed records", () => {
  const summary = buildInternalWorkspaceSummary(SAMPLE_RECORDS, SNAPSHOT_NOW);

  assert.equal(summary.total, 4);
  assert.equal(summary.needAction, 2);
  assert.equal(summary.reviewCount, 1);
  assert.equal(summary.readyCount, 2);
});

test("workspace summary uses effective status for expired records", () => {
  const summary = buildInternalWorkspaceSummary(EXPIRY_AWARE_RECORDS, NOW);

  assert.equal(summary.total, 5);
  assert.equal(summary.needAction, 2);
  assert.equal(summary.reviewCount, 1);
  assert.equal(summary.readyCount, 2);
});

test("task list records stay focused on open internal work", () => {
  const visibleIds = getTaskListRecords(
    [
      ...EXPIRY_AWARE_RECORDS,
      {
        id: "TRX-007",
        status: "Rejected",
        validUntil: "30 Juni 2026",
      },
    ],
    NOW,
  ).map((item) => item.id);

  assert.deepEqual(visibleIds, ["TRX-001", "TRX-002", "TRX-003", "TRX-005"]);
});
