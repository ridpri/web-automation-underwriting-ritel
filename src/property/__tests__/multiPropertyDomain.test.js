import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  calculateMultiPropertyPolicy,
  createMultiPropertyDraft,
  deriveConstructionClass,
  FLAMMABLE_MATERIAL_OPTIONS,
  getMultiPropertyStepOnePendingItems,
  getMultiPropertyStepTwoPendingItems,
  ROOF_MATERIAL_OPTIONS,
  STRUCTURE_MATERIAL_OPTIONS,
  WALL_MATERIAL_OPTIONS,
} from "../multiPropertyDomain.js";

const extensions = [
  { key: "riot", rate: 0.0001, title: "Kerusuhan" },
  { key: "earthquake", rate: 0.01, title: "Gempa" },
];

describe("multiPropertyDomain", () => {
  it("derives construction class from guided material answers", () => {
    assert.equal(
      deriveConstructionClass({
        wallMaterial: WALL_MATERIAL_OPTIONS[0],
        structureMaterial: STRUCTURE_MATERIAL_OPTIONS[0],
        roofMaterial: ROOF_MATERIAL_OPTIONS[0],
        flammableMaterial: FLAMMABLE_MATERIAL_OPTIONS[0],
      }),
      "Kelas 1",
    );
    assert.equal(
      deriveConstructionClass({
        wallMaterial: WALL_MATERIAL_OPTIONS[1],
        structureMaterial: STRUCTURE_MATERIAL_OPTIONS[0],
        roofMaterial: ROOF_MATERIAL_OPTIONS[0],
        flammableMaterial: FLAMMABLE_MATERIAL_OPTIONS[0],
      }),
      "Kelas 2",
    );
    assert.equal(
      deriveConstructionClass({
        wallMaterial: WALL_MATERIAL_OPTIONS[0],
        structureMaterial: STRUCTURE_MATERIAL_OPTIONS[0],
        roofMaterial: ROOF_MATERIAL_OPTIONS[2],
        flammableMaterial: FLAMMABLE_MATERIAL_OPTIONS[0],
      }),
      "Kelas 3",
    );
  });

  it("calculates per-property premium and one policy total", () => {
    const propertyOne = createMultiPropertyDraft(0, {
      propertyType: "Rumah Tinggal",
      occupancy: "Hunian",
      constructionClass: "Kelas 1",
      locationSearch: "Jl. Melati 1",
      objectRows: [
        { id: "obj-1", type: "Bangunan", amount: "1.000.000.000", note: "Rumah utama" },
        { id: "obj-2", type: "Inventaris / Isi", amount: "250.000.000", note: "Isi rumah" },
      ],
      selectedGuarantees: { riot: true, earthquake: false },
    });
    const propertyTwo = createMultiPropertyDraft(1, {
      propertyType: "Ruko",
      occupancy: "Ritel / Toko",
      constructionClass: "Kelas 2",
      locationSearch: "Ruko Blok A",
      objectRows: [{ id: "obj-1", type: "Bangunan", amount: "500.000.000", note: "Ruko" }],
      selectedGuarantees: { riot: false, earthquake: true },
    });

    const result = calculateMultiPropertyPolicy([propertyOne, propertyTwo], extensions);

    assert.equal(result.propertyQuotes.length, 2);
    assert.equal(result.propertyQuotes[0].totalValue, 1_250_000_000);
    assert.equal(result.propertyQuotes[0].basePremium, 2_312_500);
    assert.equal(result.propertyQuotes[0].extensionPremium, 125_000);
    assert.equal(result.propertyQuotes[0].totalPremium, 2_437_500);
    assert.equal(result.propertyQuotes[1].totalValue, 500_000_000);
    assert.equal(result.propertyQuotes[1].basePremium, 1_325_000);
    assert.equal(result.propertyQuotes[1].extensionPremium, 5_000_000);
    assert.equal(result.propertyQuotes[1].totalPremium, 6_325_000);
    assert.equal(result.totalValue, 1_750_000_000);
    assert.equal(result.stampDuty, 20_000);
    assert.equal(result.totalPremium, 8_782_500);
  });

  it("applies shared policy guarantees to every property", () => {
    const propertyOne = createMultiPropertyDraft(0, {
      propertyType: "Rumah Tinggal",
      occupancy: "Hunian",
      constructionClass: "Kelas 1",
      locationSearch: "Jl. Melati 1",
      objectRows: [{ id: "obj-1", type: "Bangunan", amount: "1.000.000.000", note: "Rumah utama" }],
      selectedGuarantees: { riot: false, earthquake: false },
    });
    const propertyTwo = createMultiPropertyDraft(1, {
      propertyType: "Ruko",
      occupancy: "Ritel / Toko",
      constructionClass: "Kelas 2",
      locationSearch: "Ruko Blok A",
      objectRows: [{ id: "obj-1", type: "Bangunan", amount: "500.000.000", note: "Ruko" }],
      selectedGuarantees: { riot: false, earthquake: false },
    });

    const result = calculateMultiPropertyPolicy([propertyOne, propertyTwo], extensions, { riot: true, earthquake: false });

    assert.equal(result.propertyQuotes[0].extensionPremium, 100_000);
    assert.equal(result.propertyQuotes[1].extensionPremium, 50_000);
    assert.equal(result.extensionPremium, 150_000);
    assert.equal(result.stampDuty, 10_000);
  });

  it("returns step one pending items by property", () => {
    const properties = [
      createMultiPropertyDraft(0, {
        occupancy: "Hunian",
        constructionClass: "Kelas 1",
        locationSearch: "Jl. Melati 1",
        objectRows: [{ id: "obj-1", type: "Bangunan", amount: "800.000.000", note: "" }],
      }),
      createMultiPropertyDraft(1, {
        occupancy: "",
        constructionClass: "",
        locationSearch: "",
        objectRows: [{ id: "obj-1", type: "", amount: "", note: "" }],
        selectedGuarantees: { earthquake: true },
      }),
    ];

    const result = getMultiPropertyStepOnePendingItems({
      identity: "",
      phone: "123",
      email: "not-email",
      properties,
    });

    assert.deepEqual(result, [
      "Isi nama calon pemegang polis atau pilih CIF.",
      "Lengkapi nomor handphone dan alamat email yang valid.",
      "Properti 2: pilih penggunaan properti.",
      "Properti 2: isi alamat properti.",
      "Properti 2: pilih kelas konstruksi.",
      "Properti 2: lengkapi jenis dan nilai objek pertanggungan.",
      "Properti 2: lengkapi jumlah lantai untuk perluasan Gempa Bumi.",
    ]);
  });

  it("uses guided construction wording for external property pending items", () => {
    const properties = [
      createMultiPropertyDraft(0, {
        occupancy: "Hunian",
        constructionClass: "",
        locationSearch: "Jl. Melati 1",
        objectRows: [{ id: "obj-1", type: "Bangunan", amount: "800.000.000", note: "" }],
      }),
    ];

    const result = getMultiPropertyStepOnePendingItems({
      identity: "Budi Santoso",
      phone: "081234567890",
      email: "budi@example.com",
      properties,
      constructionInputMode: "guided",
    });

    assert.deepEqual(result, ["Properti 1: lengkapi panduan konstruksi."]);
  });

  it("validates floor count from shared earthquake guarantee", () => {
    const properties = [
      createMultiPropertyDraft(0, {
        propertyType: "Ruko",
        occupancy: "Ritel / Toko",
        constructionClass: "Kelas 1",
        locationSearch: "Ruko Blok A",
        objectRows: [{ id: "obj-1", type: "Bangunan", amount: "800.000.000", note: "" }],
        selectedGuarantees: { earthquake: false },
        floorCount: "",
      }),
    ];

    const result = getMultiPropertyStepOnePendingItems({
      identity: "Budi Santoso",
      phone: "081234567890",
      email: "budi@example.com",
      properties,
      selectedGuarantees: { earthquake: true },
    });

    assert.deepEqual(result, ["Properti 1: lengkapi jumlah lantai untuk perluasan Gempa Bumi."]);
  });

  it("requires office floor count as property data without duplicating earthquake input", () => {
    const properties = [
      createMultiPropertyDraft(0, {
        propertyType: "Kantor",
        occupancy: "Kantor",
        constructionClass: "Kelas 1",
        locationSearch: "Gedung Sudirman",
        objectRows: [{ id: "obj-1", type: "Bangunan", amount: "800.000.000", note: "Kantor" }],
        floorCount: "",
      }),
    ];

    const baseRequest = {
      identity: "Budi Santoso",
      phone: "081234567890",
      email: "budi@example.com",
      properties,
    };

    assert.deepEqual(getMultiPropertyStepOnePendingItems(baseRequest), ["Properti 1: lengkapi jumlah lantai untuk properti kantor."]);
    assert.deepEqual(
      getMultiPropertyStepOnePendingItems({
        ...baseRequest,
        selectedGuarantees: { earthquake: true },
      }),
      ["Properti 1: lengkapi jumlah lantai untuk properti kantor."],
    );
  });

  it("requires policy identity number and one shared coverage start date for step two", () => {
    const properties = [
      createMultiPropertyDraft(0, {
        objectRows: [{ id: "obj-1", type: "Bangunan", amount: "800.000.000", note: "" }],
        uwForm: {
          picName: "Budi",
          coverageStartDate: "",
          fireProtectionChoice: "Tidak Ada",
          fireProtectionItems: [],
          claimHistory: "Tidak Ada",
          stockType: "",
          additionalNotes: "Tidak perlu tampil",
        },
        uploads: { frontView: "front", sideRightView: "right", sideLeftView: "left" },
      }),
      createMultiPropertyDraft(1, {
        objectRows: [{ id: "obj-1", type: "Bangunan", amount: "600.000.000", note: "" }],
        uwForm: {
          picName: "Siti",
          coverageStartDate: "",
          fireProtectionChoice: "Tidak Ada",
          fireProtectionItems: [],
          claimHistory: "Tidak Ada",
          stockType: "",
          additionalNotes: "Tidak perlu tampil",
        },
        uploads: { frontView: "front", sideRightView: "right", sideLeftView: "left" },
      }),
    ];

    assert.deepEqual(
      getMultiPropertyStepTwoPendingItems({
        customerType: "Nasabah Perorangan",
        idNumber: "",
        coverageStartDate: "",
        properties,
      }),
      ["NIK yang diisi harus 16 digit.", "Lengkapi tanggal mulai pertanggungan."],
    );

    assert.deepEqual(
      getMultiPropertyStepTwoPendingItems({
        customerType: "Nasabah Perorangan",
        idNumber: "",
        coverageStartDate: "2026-05-05",
        properties,
      }),
      ["NIK yang diisi harus 16 digit."],
    );

    assert.deepEqual(
      getMultiPropertyStepTwoPendingItems({
        customerType: "Nasabah Perorangan",
        idNumber: "3173010101010001",
        coverageStartDate: "2026-05-05",
        properties,
      }),
      [],
    );
  });

  it("returns step two pending items for each incomplete property", () => {
    const completeProperty = createMultiPropertyDraft(0, {
      objectRows: [{ id: "obj-1", type: "Bangunan", amount: "800.000.000", note: "" }],
      uwForm: {
        idNumber: "",
        picName: "Budi",
        coverageStartDate: "",
        fireProtectionChoice: "Ada",
        fireProtectionItems: ["APAR"],
        claimHistory: "Tidak Ada",
        stockType: "",
        additionalNotes: "",
      },
      uploads: { frontView: "front", sideRightView: "right", sideLeftView: "left" },
    });
    const incompleteProperty = createMultiPropertyDraft(1, {
      objectRows: [{ id: "obj-1", type: "Stok", amount: "125.000.000", note: "Barang" }],
      uwForm: {
        idNumber: "",
        picName: "",
        coverageStartDate: "",
        fireProtectionChoice: "Ada",
        fireProtectionItems: [],
        claimHistory: "",
        stockType: "",
        additionalNotes: "",
      },
      uploads: { frontView: "", sideRightView: "", sideLeftView: "" },
    });

    const result = getMultiPropertyStepTwoPendingItems({
      customerType: "Badan Usaha",
      idNumber: "12345",
      coverageStartDate: "2026-05-05",
      properties: [completeProperty, incompleteProperty],
    });

    assert.deepEqual(result, [
      "NPWP yang diisi minimal 15 digit.",
      "Properti 2: lengkapi kontak properti.",
      "Properti 2: pilih minimal satu proteksi kebakaran.",
      "Properti 2: lengkapi riwayat klaim.",
      "Properti 2: pilih jenis stok.",
      "Properti 2: unggah foto tampak depan, samping kanan, dan samping kiri.",
    ]);
  });
});
