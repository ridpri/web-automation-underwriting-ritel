# Multi Motor Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable the existing multi-vehicle flow for motorcycle journeys only, with an upload icon placeholder in multi mode.

**Architecture:** `MotorLatestExact.tsx` already owns vehicle flow mode and renders `MultiVehicleFlow`. The implementation should gate multi mode to `flowType === "motor"` so car TLO and car comprehensive remain single-object journeys. `MultiVehicleFlow.jsx` should render an upload icon button in its vehicle section header without parsing files yet.

**Tech Stack:** React, Vite, Node test runner, Playwright for browser smoke checks.

---

### Task 1: Add Domain Coverage For Motor-Only Multi Availability

**Files:**
- Modify: `src/vehicle/multiVehicleDomain.js`
- Test: `src/vehicle/__tests__/multiVehicleDomain.test.js`

- [ ] **Step 1: Write the failing test**

Add this import:

```js
import {
  calculateMultiVehiclePolicy,
  createMultiVehicleDraft,
  getMultiVehicleStepOnePendingItems,
  getMultiVehicleStepTwoPendingItems,
  isMultiVehicleFlowEnabled,
} from "../multiVehicleDomain.js";
```

Add this test:

```js
it("enables multi vehicle flow for motor only", () => {
  assert.equal(isMultiVehicleFlowEnabled("motor"), true);
  assert.equal(isMultiVehicleFlowEnabled("carTlo"), false);
  assert.equal(isMultiVehicleFlowEnabled("carComp"), false);
  assert.equal(isMultiVehicleFlowEnabled(""), false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
npm.cmd run test:domain
```

Expected: FAIL because `isMultiVehicleFlowEnabled` is not exported.

- [ ] **Step 3: Write minimal implementation**

Add this export near the other small helpers in `src/vehicle/multiVehicleDomain.js`:

```js
export function isMultiVehicleFlowEnabled(flowType) {
  return flowType === "motor";
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```powershell
npm.cmd run test:domain
```

Expected: all domain tests pass.

### Task 2: Gate Multi UI To Motor Journeys

**Files:**
- Modify: `src/MotorLatestExact.tsx`
- Test: browser smoke via Playwright script

- [ ] **Step 1: Import the domain gate**

Change:

```ts
import { createMultiVehicleDraft } from "./vehicle/multiVehicleDomain.js";
```

To:

```ts
import { createMultiVehicleDraft, isMultiVehicleFlowEnabled } from "./vehicle/multiVehicleDomain.js";
```

- [ ] **Step 2: Compute the gate**

Near existing mode booleans, add:

```ts
const supportsMultiVehicleMode = isMultiVehicleFlowEnabled(flowType);
```

- [ ] **Step 3: Prevent switching to multi outside motor**

At the top of `switchToMultiVehicleFlow`, add:

```ts
if (!supportsMultiVehicleMode) return;
```

- [ ] **Step 4: Auto-return car flows to single mode**

Add a React effect after `supportsMultiVehicleMode` is defined:

```ts
useEffect(() => {
  if (!supportsMultiVehicleMode && vehicleObjectMode === "multi") {
    setVehicleObjectMode("single");
  }
}, [supportsMultiVehicleMode, vehicleObjectMode]);
```

- [ ] **Step 5: Hide the switch when multi is unavailable**

Change the `vehicleFlowModeAction` assignment to return the switch only when supported:

```tsx
const vehicleFlowModeAction = supportsMultiVehicleMode ? (
  <VehicleFlowModeSwitch
    mode={vehicleObjectMode}
    onSingle={switchToSingleVehicleFlow}
    onMulti={switchToMultiVehicleFlow}
  />
) : null;
```

- [ ] **Step 6: Stop rendering multi flow for car journeys**

Change:

```ts
const isMultiVehicleMode = vehicleObjectMode === "multi";
```

To:

```ts
const isMultiVehicleMode = supportsMultiVehicleMode && vehicleObjectMode === "multi";
```

- [ ] **Step 7: Run lint/build**

Run:

```powershell
npx.cmd eslint src\MotorLatestExact.tsx src\vehicle\multiVehicleDomain.js src\vehicle\__tests__\multiVehicleDomain.test.js
npm.cmd run build
```

Expected: both commands exit 0.

### Task 3: Add Upload Icon Placeholder In Multi Motor Header

**Files:**
- Modify: `src/vehicle/MultiVehicleFlow.jsx`

- [ ] **Step 1: Add icon import**

Add `Upload` to the lucide import list:

```js
Upload,
```

- [ ] **Step 2: Add a placeholder button next to Add Vehicle**

In the `SectionCard title="Informasi Kendaraan"` action, render:

```jsx
<button
  type="button"
  title="Upload CSV / Excel"
  aria-label="Upload CSV / Excel"
  onClick={() => updatePolicy({ notice: "Upload CSV / Excel akan disiapkan pada tahap berikutnya. Untuk saat ini, tambah kendaraan secara manual." })}
  className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#D5DDE6] bg-white text-slate-600 hover:bg-slate-50 hover:text-[#0A4D82]"
>
  <Upload className="h-4 w-4" />
</button>
```

Place it before `Tambah Kendaraan` so the header reads: upload icon, add vehicle, mode switch.

- [ ] **Step 3: Run lint/build**

Run:

```powershell
npx.cmd eslint src\vehicle\MultiVehicleFlow.jsx
npm.cmd run build
```

Expected: both commands exit 0.

### Task 4: Browser Verification

**Files:**
- No production code changes.

- [ ] **Step 1: Verify motor has multi switch and upload icon**

Use Playwright against local dev server:

```powershell
@'
import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
await page.goto('http://127.0.0.1:4180/internal/motor', { waitUntil: 'networkidle' });
await page.getByLabel('Beberapa Kendaraan').click();
await page.getByLabel('Upload CSV / Excel').waitFor({ timeout: 10000 });
await page.getByRole('button', { name: 'Tambah Kendaraan' }).waitFor({ timeout: 10000 });
console.log('motor multi controls ok');
await browser.close();
'@ | node --input-type=module
```

Expected: prints `motor multi controls ok`.

- [ ] **Step 2: Verify car flows do not show multi switch**

Run:

```powershell
@'
import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
for (const path of ['/internal/car-tlo', '/internal/car-comprehensive']) {
  await page.goto(`http://127.0.0.1:4180${path}`, { waitUntil: 'networkidle' });
  const multiSwitchCount = await page.getByLabel('Beberapa Kendaraan').count();
  if (multiSwitchCount !== 0) throw new Error(`${path} still shows multi switch`);
}
console.log('car flows remain single');
await browser.close();
'@ | node --input-type=module
```

Expected: prints `car flows remain single`.

### Task 5: Final Verification

**Files:**
- No production code changes.

- [ ] **Step 1: Run full local verification**

Run:

```powershell
npm.cmd run test:domain
npx.cmd eslint src\MotorLatestExact.tsx src\vehicle\MultiVehicleFlow.jsx src\vehicle\multiVehicleDomain.js src\vehicle\__tests__\multiVehicleDomain.test.js
npm.cmd run build
```

Expected: all commands exit 0.

- [ ] **Step 2: Report deploy status**

Do not deploy unless explicitly requested after implementation. Report the local URL and verification commands.
