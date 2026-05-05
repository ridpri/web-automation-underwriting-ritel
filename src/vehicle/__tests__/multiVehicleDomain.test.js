import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  calculateMultiVehiclePolicy,
  createMultiVehicleDraft,
  getMultiVehicleStepOnePendingItems,
  getMultiVehicleStepTwoPendingItems,
} from "../multiVehicleDomain.js";

describe("multiVehicleDomain", () => {
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
      "Kendaraan 2: pilih kategori OJK kendaraan.",
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
      address: "",
      email: "rama@example.com",
      phone: "081234567890",
      coverageStartDate: "",
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
});
