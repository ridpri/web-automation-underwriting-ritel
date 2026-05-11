import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getPropertyExtensions, getPropertyVariant } from "../../propertyProductConfig.js";

describe("property product variants", () => {
  it("keeps Property All Risk multi flow on the Property All Risk product setup", () => {
    const variant = getPropertyVariant("property-all-risk");
    const extensionKeys = getPropertyExtensions("property-all-risk").map((item) => item.key);

    assert.equal(variant.title, "Asuransi Property All Risk");
    assert.deepEqual(extensionKeys, ["riot", "tsfwd", "earthquake"]);
  });
});
