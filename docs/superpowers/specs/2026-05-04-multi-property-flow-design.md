# Multi Property Flow Design

## Goal

Support one property policy that can contain more than one insured property or location, while keeping the existing one-property production flow intact.

## Product Decision

The existing flow remains the default single-property journey. A control in the property page header lets the user switch to a dedicated multi-property journey. The multi journey shares the same application shell, product identity, stepper, colors, side summary, and payment style, but its step content is purpose-built for multiple properties.

The UI uses "Satu Properti" and "Beberapa Properti" wording. It keeps "objek" for items inside one property, such as building, contents, stock, and equipment.

## Flow

### Step 1: Simulasi Beberapa Properti

The page shows one card per property. Each property has its own location, occupancy, construction class, insured object rows, and optional earthquake floor count. Users can add or remove property cards. Premium is calculated per property and summarized as one policy total.

### Step 2: Data Lanjutan Beberapa Properti

Policyholder data stays at policy level. Location-specific underwriting data is captured per property: contact at location, fire protection, claim history, stock type when relevant, notes, and required photos.

### Step 3: Review & Pembayaran

The review displays one policy summary, a schedule of insured properties, total sum insured, premium by property, extension premium, stamp duty, and total payment. Payment remains one transaction for one policy.

## Data Shape

The multi journey uses `properties[]`. Each item owns its quote fields, object rows, underwriting fields, uploads, selected guarantees, and expanded UI rows. Shared policy fields remain outside the array.

## Migration Behavior

If the user switches from single to multi after filling the single form, the app converts the current form into `Properti 1`. If the user switches back to single, the app keeps `Properti 1` as the restored single form and leaves the rest behind.

## Validation

Step 1 requires policyholder identity/contact plus every property having occupancy, location, construction, positive insured object values, and floor count when earthquake applies. Step 2 requires valid policyholder ID if entered and complete per-property underwriting/photo data.

## Testing

Pure multi-property calculation and validation helpers are tested first. The React page uses those helpers so pricing and pending-item behavior are not buried inside JSX.
