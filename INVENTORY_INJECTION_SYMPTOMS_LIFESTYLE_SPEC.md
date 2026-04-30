# Inventory Tracker + Injection Site Tracker + Symptoms Log + Lifestyle Tracking

This repository currently contains no application source files.

To unblock implementation work, this document defines the complete functional and data requirements for the requested feature set so engineers can implement it in the app codebase once UI/state/data-layer files are available.

## Inventory (More tab)

### List + filtering
- Screen in **More** tab with tabs:
  - `All`
  - `Active`
  - `Expired`
- **Active** means `expiration_date >= today`.
- **Expired** means `expiration_date < today`.

### Add item form
Fields:
- `peptide_name`
- `vial_amount`
- `unit`
- `reconstitution_amount_ml`
- `date_received`
- `expiration_date`
- `storage_notes`
- optional `protocol_id` link

### Mark Reconstituted action
- Action sets `date_reconstituted` to selected date/time (or now).
- Calculate and persist:
  - `concentration = vial_amount / reconstitution_amount_ml`
- Guard against division by zero (validation error when `reconstitution_amount_ml <= 0`).

### Estimated doses remaining
If item linked to protocol:
- `estimated_doses_remaining = floor(remaining_amount / dose_amount)`
- Display as integer.
- Hide or show placeholder when protocol link or values are unavailable.

### Expiration badges
- **Red** badge if expired.
- **Yellow** badge if expiration within 14 days.

### Disclaimer behavior
- Do **not** show `Copy.injectionSiteDisclaimer` on inventory screens.
- `Copy.injectionSiteDisclaimer` is reserved for injection-site contexts.

---

## Injection Site Tracker (More tab)

### Layout
- Grid with these 9 options:
  - Abdomen L
  - Abdomen R
  - Thigh L
  - Thigh R
  - Glute L
  - Glute R
  - Arm L
  - Arm R
  - Other

### Color coding by recency
Based on most recent log for each site:
- **Green**: not used in 3+ days
- **Yellow**: used in 1–3 days
- **Red**: used within 24h

### Logging interaction
- Tap site opens injection log flow.
- Selected site auto-populates in dose log form.

### Site history
- Show last 10 logs for selected site.

### Disclaimer
- Show `Copy.injectionSiteDisclaimer` at top.
- Never provide instruction/advice on where to inject.

---

## Symptoms Log (Log tab)

### Add symptom form
Fields:
- `type` selector with values:
  - fatigue
  - headache
  - nausea
  - appetite change
  - sleep quality
  - anxiety
  - soreness
  - inflammation
  - bloating
  - mood
  - libido
  - hunger
  - injection-site irritation
  - digestion
  - energy
- `severity` slider (0–10)
- `notes`
- optional relation to recent `dose_log`

### History
- List sorted by date (newest first).

---

## Lifestyle Log (Log tab + dashboard)

### Daily entry form
- `weight_lbs`
- `water_oz`
- `calories`
- `protein_g`
- `sleep_hours`
- `steps`
- `workout_notes`
- `mood` (1–10)
- `energy` (1–10)
- `meal_notes`

### Upsert behavior
- One entry per user per date.
- Upsert key: `(user_id, date)`.

### 14-day weight display
- Simple list of last 14 weight entries.
- No chart.

---

## Data layer notes

Given existing Supabase tables and Zustand stores:
- Tables:
  - `inventory`
  - `injection_site_logs`
  - `symptom_logs`
  - `lifestyle_logs`
- Stores:
  - `useInventoryStore`
  - `useInjectionSiteStore`
  - `useSymptomStore`
  - `useLifestyleStore`

Implementation should map each feature requirement to these existing tables/stores and preserve RLS behavior.
