import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  calculateMultiVehiclePolicy,
  createMultiVehicleDraft,
  getMultiVehicleStepOnePendingItems,
  getMultiVehicleStepTwoPendingItems,
  getMultiVehicleReviewPendingItems,
  isMultiVehicleFlowEnabled,
  MULTI_VEHICLE_UPLOAD_SLOTS,
} from "../multiVehicleDomain.js";

describe("multiVehicleDomain", () => {
  it("does not request a chassis number photo for comprehensive cars", () => {
    const carCompSlots = MULTI_VEHICLE_UPLOAD_SLOTS.carComp.map((slot) => slot.label);

    assert.equal(carCompSlots.some((label) => label.toLowerCase().includes("rangka") || label.toLowerCase().includes("vin")), false);
  });

  it("enables multi vehicle flow for all vehicle products", () => {
    assert.equal(isMultiVehicleFlowEnabled("motor"), true);
    assert.equal(isMultiVehicleFlowEnabled("carTlo"), true);
    assert.equal(isMultiVehicleFlowEnabled("carComp"), true);
    assert.equal(isMultiVehicleFlowEnabled(""), false);
  });

  it("calculates one policy total from multiple motor vehicles", () => {
    const vehicles = [
      createMultiVehicleDraft("motor", 0, {
        quote: {
          plateRegion: "B - Jakarta/Depok/Tangerang/Bekasi",
          year: "2025",
          usage: "Pribadi",
          vehicleName: "Yamaha NMAX 155 Connected",
          marketValue: "36500000",
          extensions: {
            tpl: { enabled: true, amount: 1000000 },
            srcc: { enabled: false },
            ts: { enabled: false },
            flood: { enabled: false },
            quake: { enabled: false },
          },
        },
      }),
      createMultiVehicleDraft("motor", 1, {
        quote: {
          plateRegion: "D - Bandung",
          year: "2024",
          usage: "Pribadi",
          vehicleName: "Honda PCX 160",
          marketValue: "32000000",
          extensions: {
            tpl: { enabled: false, amount: 1000000 },
            srcc: { enabled: true },
            ts: { enabled: false },
            flood: { enabled: false },
            quake: { enabled: false },
          },
        },
      }),
    ];

    const result = calculateMultiVehiclePolicy("motor", vehicles);

    assert.equal(result.vehicleQuotes.length, 2);
    assert.equal(result.vehicleQuotes[0].mainPremium, 657000);
    assert.equal(result.vehicleQuotes[0].extensionPremium, 10000);
    assert.equal(result.vehicleQuotes[1].mainPremium, 576000);
    assert.equal(result.vehicleQuotes[1].extensionPremium, 11200);
    assert.equal(result.marketValue, 68500000);
    assert.equal(result.mainPremium, 1233000);
    assert.equal(result.extensionPremium, 21200);
    assert.equal(result.stampDuty, 10000);
    assert.equal(result.totalPremium, 1264200);
  });

  it("returns step one pending items per vehicle", () => {
    const completeVehicle = createMultiVehicleDraft("carTlo", 0, {
      quote: {
        plateRegion: "B - Jakarta/Depok/Tangerang/Bekasi",
        year: "2023",
        usage: "Pribadi",
        vehicleName: "Toyota Avanza 1.5 G",
        vehicleType: "Angkutan Penumpang",
        marketValue: "248000000",
      },
    });
    const incompleteVehicle = createMultiVehicleDraft("carTlo", 1, {
      quote: {
        plateRegion: "",
        year: "2001",
        usage: "",
        vehicleName: "",
        vehicleType: "",
        marketValue: "",
      },
    });

    const result = getMultiVehicleStepOnePendingItems({
      flowType: "carTlo",
      insuredName: "",
      phone: "123",
      email: "not-email",
      vehicles: [completeVehicle, incompleteVehicle],
    });

    assert.deepEqual(result, [
      "Isi nama calon pemegang polis atau pilih CIF.",
      "Lengkapi nomor handphone dan alamat email yang valid.",
      "Kendaraan 2: pilih merek / tipe kendaraan.",
      "Kendaraan 2: pilih kode wilayah plat / TNKB.",
      "Kendaraan 2: tahun kendaraan melewati batas usia produk.",
      "Kendaraan 2: isi harga pertanggungan yang valid.",
      "Kendaraan 2: pilih penggunaan kendaraan.",
      "Kendaraan 2: pilih merek / tipe kendaraan dari database.",
    ]);
  });

  it("returns step two pending items per vehicle", () => {
    const completeVehicle = createMultiVehicleDraft("motor", 0, {
      vehicle: {
        plateNumber: "B 4123 UYT",
        chassisNumber: "MH1JM8112PK123456",
        engineNumber: "JM81E1234567",
        color: "Hitam",
        contactOnLocation: "Rama",
      },
      underwriting: { claimHistory: "Tidak Ada" },
      uploads: {
        frontAngle: true,
        sideFull: true,
        speedometer: true,
      },
    });
    const incompleteVehicle = createMultiVehicleDraft("motor", 1, {
      vehicle: {
        plateNumber: "",
        chassisNumber: "",
        engineNumber: "",
        color: "",
        contactOnLocation: "",
      },
      underwriting: { claimHistory: "" },
      uploads: {
        frontAngle: true,
        sideFull: false,
        speedometer: false,
      },
    });

    const result = getMultiVehicleStepTwoPendingItems({
      insuredName: "Rama",
      idNumber: "3173010101010001",
      address: "",
      email: "rama@example.com",
      phone: "081234567890",
      coverageStartDate: "",
      coverageEndDate: "",
      vehicles: [completeVehicle, incompleteVehicle],
    });

    assert.deepEqual(result, [
      "Alamat calon pemegang polis belum lengkap.",
      "Tanggal mulai perlindungan belum diisi.",
      "Kendaraan 2: nomor polisi / TNKB belum lengkap.",
      "Kendaraan 2: nomor rangka kendaraan belum lengkap.",
      "Kendaraan 2: nomor mesin kendaraan belum lengkap.",
      "Kendaraan 2: riwayat klaim 3 tahun terakhir belum diisi.",
      "Kendaraan 2: foto kendaraan belum lengkap.",
    ]);
  });

  it("requires existing damage condition for multi comprehensive cars", () => {
    const vehicle = createMultiVehicleDraft("carComp", 0, {
      quote: {
        vehicleName: "BYD Atto 3 Advanced",
      },
      vehicle: {
        plateNumber: "B 1458 NZX",
        chassisNumber: "LGXCE4CB8R1234567",
        engineNumber: "ATTO3EV123456",
        color: "Putih",
      },
      underwriting: { claimHistory: "Tidak Ada", existingDamageStatus: "" },
      uploads: {
        frontView: true,
        backView: true,
        rightView: true,
        leftView: true,
        dashboardView: true,
        stnkView: true,
      },
    });

    const result = getMultiVehicleStepTwoPendingItems({
      flowType: "carComp",
      insuredName: "Rama",
      customerType: "Pribadi",
      idNumber: "3173010101010001",
      address: "Jl. Kemang Raya No. 18, Jakarta Selatan",
      email: "rama@example.com",
      phone: "081234567890",
      coverageStartDate: "2026-05-01",
      coverageEndDate: "2026-11-01",
      vehicles: [vehicle],
    });

    assert.deepEqual(result, ["BYD Atto 3 Advanced: jawaban kerusakan pada kendaraan belum dipilih."]);
  });

  it("requires a multi vehicle coverage period of at least six months", () => {
    const vehicle = createMultiVehicleDraft("motor", 0, {
      vehicle: {
        plateNumber: "B 4123 UYT",
        chassisNumber: "MH1JM8112PK123456",
        engineNumber: "JM81E1234567",
      },
      underwriting: { claimHistory: "Tidak Ada" },
      uploads: {
        frontAngle: true,
        sideFull: true,
        speedometer: true,
      },
    });

    const base = {
      flowType: "motor",
      insuredName: "Rama",
      customerType: "Pribadi",
      idNumber: "3173010101010001",
      address: "Jl. Kemang Raya No. 18, Jakarta Selatan",
      email: "rama@example.com",
      phone: "081234567890",
      coverageStartDate: "2026-05-01",
      vehicles: [vehicle],
    };

    assert.deepEqual(getMultiVehicleStepTwoPendingItems({ ...base, coverageEndDate: "" }), [
      "Tanggal akhir perlindungan belum diisi.",
    ]);
    assert.deepEqual(getMultiVehicleStepTwoPendingItems({ ...base, coverageEndDate: "2026-10-30" }), [
      "Jangka waktu pertanggungan minimal 6 bulan.",
    ]);
    assert.deepEqual(getMultiVehicleStepTwoPendingItems({ ...base, coverageEndDate: "2026-10-31" }), []);
    assert.deepEqual(getMultiVehicleStepTwoPendingItems({ ...base, coverageEndDate: "2026-11-01" }), []);
    assert.deepEqual(getMultiVehicleStepTwoPendingItems({ ...base, coverageEndDate: "2027-12-01" }), []);
  });

  it("returns review pending items when a multi vehicle policy needs underwriting review", () => {
    assert.deepEqual(getMultiVehicleReviewPendingItems("Straight Through"), []);
    assert.deepEqual(getMultiVehicleReviewPendingItems("Need Review"), [
      "Profil risiko salah satu kendaraan masih perlu dicek oleh underwriter sebelum pembayaran.",
    ]);
  });
});
