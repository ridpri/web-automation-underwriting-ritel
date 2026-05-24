import test from "node:test";
import assert from "node:assert/strict";

import { portalMenuUrlFromUrl, readPortalMenuFromUrl } from "../staffWorkspaceNavigation.js";

test("workspace entry ignores stale menu path and opens dashboard", () => {
  const menu = readPortalMenuFromUrl("http://localhost/promotion?journey=internal-workspace&role=internal", "dashboard");

  assert.equal(menu, "dashboard");
});

test("workspace menu query keeps explicit internal menu selection", () => {
  const menu = readPortalMenuFromUrl("http://localhost/dashboard?journey=internal-workspace&role=internal&menu=promotion", "dashboard");

  assert.equal(menu, "promotion");
});

test("workspace menu url stores internal menu without changing the entry path", () => {
  const url = portalMenuUrlFromUrl("http://localhost/promotion?journey=internal-workspace&role=internal", "promotion");

  assert.equal(url.pathname, "/dashboard");
  assert.equal(url.searchParams.get("menu"), "promotion");
  assert.equal(url.searchParams.get("journey"), "internal-workspace");
});
