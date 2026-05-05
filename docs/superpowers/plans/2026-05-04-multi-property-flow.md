# Multi Property Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dedicated Beberapa Properti mode to the existing property journey without disrupting the current single-property production flow.

**Architecture:** Keep `PropertyPrototype.jsx` as the active routed screen, but move multi-property pricing and validation into a focused helper module. The page renders either the existing single flow or a dedicated three-step multi flow under the same shell.

**Tech Stack:** React 19, Vite, plain JavaScript modules, Node built-in test runner for helper tests, existing Tailwind utility styling.

---

### Task 1: Multi-Property Domain Helpers

**Files:**
- Create: `src/property/multiPropertyDomain.js`
- Create: `src/property/__tests__/multiPropertyDomain.test.js`
- Modify: `package.json`

- [x] **Step 1: Write failing tests for multi-property totals and validation**

Tests cover per-property sum insured, base premium minimum, selected extension premium, stamp duty, policy total, step 1 pending items, and step 2 pending items.

- [x] **Step 2: Run tests and verify they fail**

Run: `npm run test:domain`
Expected: fail because `src/property/multiPropertyDomain.js` does not exist yet.

- [x] **Step 3: Implement helper module**

Create pure functions for property factory, quote calculation, policy totals, and validation lists.

- [x] **Step 4: Run tests and verify they pass**

Run: `npm run test:domain`
Expected: pass.

### Task 2: Multi-Property UI Mode

**Files:**
- Modify: `src/PropertyPrototype.jsx`

- [x] **Step 1: Add dedicated multi-property state and conversion helpers**

Keep single state untouched. Add `propertyFlowMode`, `multiProperties`, shared policy fields, and functions to convert current single form into `Properti 1`.

- [x] **Step 2: Add header mode control**

Add `Satu Properti | Beberapa Properti` control in the property shell header. Switching to multi preserves current single input as the first property.

- [x] **Step 3: Render multi step 1**

Render property cards with quote inputs, object rows, guarantees, per-property premium, and total policy summary.

- [x] **Step 4: Render multi step 2**

Render policyholder data once and underwriting/photo requirements per property.

- [x] **Step 5: Render multi step 3**

Render policy review, schedule of insured properties, payment method selection, consent, and simulated payment.

### Task 3: Verification

**Files:**
- Modify: `src/PropertyPrototype.jsx`
- Modify: `src/property/multiPropertyDomain.js`

- [x] **Step 1: Run domain tests**

Run: `npm run test:domain`
Expected: pass.

- [x] **Step 2: Run lint**

Run: `npm run lint`
Expected: pass.

- [x] **Step 3: Run production build**

Run: `npm run build`
Expected: pass.
