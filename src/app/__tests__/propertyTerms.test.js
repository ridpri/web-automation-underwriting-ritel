import test from "node:test";
import assert from "node:assert/strict";

import { buildPropertyTerms } from "../../propertyTerms.js";

test("fire property terms always include mandatory clauses and warranties", () => {
  const terms = buildPropertyTerms({ productKey: "property-safe", stockAmount: 0, occupancyCode: "2971", selectedGuarantees: {} });

  assert.equal(terms.clauses.length, 3);
  assert.equal(terms.warranties.length, 3);
  assert.deepEqual(
    terms.clauses.map((item) => item.title),
    [
      "Klausul Definisi Surat Permohonan Asuransi Umum (SPAU)",
      "Klausul Endorsemen Penyakit Menular (LMA 5393)",
      "Klausul Polis Elektronik",
    ],
  );
  assert.equal(terms.heading, "Syarat dan Ketentuan Lainnya");
});

test("fire property terms include flood clause and warranty only for flood or TSFWD extension", () => {
  const withoutFlood = buildPropertyTerms({ productKey: "property-safe", selectedGuarantees: { flood: false, tsfwd: false } });
  const withFlood = buildPropertyTerms({ productKey: "property-safe", selectedGuarantees: { flood: true } });
  const withTsfwd = buildPropertyTerms({ productKey: "property-safe", selectedGuarantees: { tsfwd: true } });

  assert.equal(withoutFlood.clauses.some((item) => item.key === "flood-endorsement"), false);
  assert.equal(withoutFlood.warranties.some((item) => item.key === "flood-location"), false);
  assert.equal(withFlood.clauses.some((item) => item.key === "flood-endorsement"), true);
  assert.equal(withFlood.warranties.some((item) => item.key === "flood-location"), true);
  assert.equal(withTsfwd.clauses.some((item) => item.key === "flood-endorsement"), true);
  assert.equal(withTsfwd.warranties.some((item) => item.key === "flood-location"), true);
});

test("fire property terms include RSMD and RSMDCC clauses from selected extensions", () => {
  const withRsmd = buildPropertyTerms({ productKey: "property-safe", selectedGuarantees: { rsmd: true } });
  const withRsmdcc = buildPropertyTerms({ productKey: "property-safe", selectedGuarantees: { rsmdcc: true } });
  const withCurrentRiotExtension = buildPropertyTerms({ productKey: "property-safe", selectedGuarantees: { riot: true } });

  assert.equal(withRsmd.clauses.some((item) => item.key === "rsmd-endorsement"), true);
  assert.equal(withRsmd.clauses.some((item) => item.key === "rsmdcc-endorsement"), false);
  assert.equal(withRsmdcc.clauses.some((item) => item.key === "rsmdcc-endorsement"), true);
  assert.equal(withCurrentRiotExtension.clauses.some((item) => item.key === "rsmdcc-endorsement"), true);
});

test("fire property terms include stock clause only when stock amount is greater than zero", () => {
  const withoutStock = buildPropertyTerms({ productKey: "property-safe", stockAmount: 0 });
  const withStock = buildPropertyTerms({ productKey: "property-safe", stockAmount: 25000000 });

  assert.equal(withoutStock.clauses.some((item) => item.key === "stock-administration"), false);
  assert.equal(withStock.clauses.some((item) => item.key === "stock-administration"), true);
});

test("fire property terms include warehouse clause only for occupancy code 2937 or 29371", () => {
  const retailTerms = buildPropertyTerms({ productKey: "property-safe", occupancyCode: "2941" });
  const warehouseTerms = buildPropertyTerms({ productKey: "property-safe", occupancyCode: "2937" });
  const detailedWarehouseTerms = buildPropertyTerms({ productKey: "property-safe", occupancyCode: "29371" });

  assert.equal(retailTerms.clauses.some((item) => item.key === "warehouse-management"), false);
  assert.equal(warehouseTerms.clauses.some((item) => item.key === "warehouse-management"), true);
  assert.equal(detailedWarehouseTerms.clauses.some((item) => item.key === "warehouse-management"), true);
});

test("property all risk terms keep generic terms until its separate rules are defined", () => {
  const terms = buildPropertyTerms({ productKey: "property-all-risk", selectedGuarantees: { flood: true, riot: true }, occupancyCode: "2937", stockAmount: 0 });

  assert.equal(terms.warranties.some((item) => item.key === "flood-location"), false);
  assert.equal(terms.clauses.some((item) => item.key === "rsmdcc-endorsement"), false);
  assert.equal(terms.clauses.some((item) => item.key === "warehouse-management"), false);
});
