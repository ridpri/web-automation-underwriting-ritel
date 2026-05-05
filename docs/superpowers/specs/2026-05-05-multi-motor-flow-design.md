# Multi Motor Flow Design

## Scope

Enable multiple insured motorcycles in one policy for the motor flow only. Car TLO and car comprehensive remain single-vehicle flows.

## Entry Point

The motor journey keeps the existing single-vehicle UI as the default. A compact icon switch lets users move between one motorcycle and multiple motorcycles, matching the pattern already used for property. In multi mode, the header for vehicle information also shows:

- `Tambah Kendaraan` to add one motorcycle manually.
- An upload icon button as a placeholder for future CSV/Excel import. It does not parse files in this phase.

## Step 1: Premium Simulation

Policyholder information is entered once. Each motorcycle appears as an accordion with its own quote inputs: motorcycle model, plate region, production year, sum insured, usage, and optional extensions. Premium simulation totals all motorcycle premiums into one policy-level payment summary.

Validation remains per motorcycle so users can see which vehicle still needs data.

## Step 2: Advanced Data

Advanced policyholder data and coverage start date are entered once for the whole policy. Each motorcycle has its own accordion for TNKB, chassis number, engine number, color, claim history, and required photos.

Pending validation messages appear above the vehicle accordions so users can see incomplete data without scrolling through every vehicle.

## Step 3: Review And Payment

For external flows, review and payment show one policy-level payment summary. Vehicle-level details are shown as a compact list, not as many payment rows.

## Out Of Scope

- CSV/Excel parsing.
- Multi-vehicle support for car TLO.
- Multi-vehicle support for car comprehensive.
- Backend persistence or real file upload.

## Verification

Add or reuse domain tests for multi motor totals and validation. Verify the UI in local browser for internal and external motor paths.
