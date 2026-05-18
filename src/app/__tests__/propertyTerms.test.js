import test from "node:test";
import assert from "node:assert/strict";

import { buildPropertyTerms } from "../../propertyTerms.js";

test("property terms always include mandatory clauses and warranties", () => {
  const terms = buildPropertyTerms({ stockAmount: 0, occupancy: "Hunian" });

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

test("property terms include stock clause only when stock amount is greater than zero", () => {
  const withoutStock = buildPropertyTerms({ stockAmount: 0, occupancy: "Toko" });
  const withStock = buildPropertyTerms({ stockAmount: 25000000, occupancy: "Toko" });

  assert.equal(withoutStock.clauses.some((item) => item.key === "stock-administration"), false);
  assert.equal(withStock.clauses.some((item) => item.key === "stock-administration"), true);
});

test("property terms include warehouse clause only for warehouse occupancy", () => {
  const retailTerms = buildPropertyTerms({ stockAmount: 10000000, occupancy: "Toko" });
  const warehouseTerms = buildPropertyTerms({ stockAmount: 0, occupancy: "Warehouse" });

  assert.equal(retailTerms.clauses.some((item) => item.key === "warehouse-management"), false);
  assert.equal(warehouseTerms.clauses.some((item) => item.key === "warehouse-management"), true);
});

test("property terms no longer include flood-specific warranty", () => {
  const terms = buildPropertyTerms({ stockAmount: 0, occupancy: "Hunian", includeFloodWarranty: true });

  assert.equal(terms.warranties.some((item) => item.key === "flood-location"), false);
  assert.equal(
    terms.warranties.some((item) => item.title.includes("rawan atau sering terkena banjir")),
    false,
  );
});
