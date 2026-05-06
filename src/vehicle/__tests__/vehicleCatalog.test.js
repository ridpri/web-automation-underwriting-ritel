import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getVehicleCatalogItem } from "../../vehicleCatalog.js";

describe("vehicle catalog", () => {
  it("returns catalog metadata from an exact vehicle label", () => {
    assert.equal(getVehicleCatalogItem("car", "BYD Atto 3 Advanced")?.ojkCategory, "Angkutan Penumpang");
    assert.equal(getVehicleCatalogItem("motor", "Yamaha NMAX 155 Connected")?.ojkCategory, "Sepeda Motor");
  });
});
