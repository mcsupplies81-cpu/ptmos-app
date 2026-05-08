# PT-OS Roadmap

## Phase 1 — Ship
- [x] Chat streaming + UX polish (animated typing indicator, keyboard-aware input, send button, suggested prompts)
- [x] Settings screen redesign (hero card, stats, subscription tier, section labels)
- [x] Error boundaries, skeleton loading, empty states, haptics
- [x] Paywall 7-day free trial copy (activates when App Store Connect intro offer is configured)
- [ ] Apple Developer account + App Store Connect setup
- [ ] EAS production build
- [ ] App Store submission

## Phase 2 — Engagement
- **Daily Check-In System** — Morning modal on home screen. Frictionless 30-second check-in: mood, energy, sleep quality, soreness, focus, motivation, libido, anxiety, confidence (1–10 sliders). Data stored in `check_ins` table. Shows on dashboard if not yet completed today.
- **Chat → Claude** — Switch edge function from OpenAI GPT-4o-mini to Anthropic Claude. Eliminates content policy hedging on peptide research topics.

## Phase 3 — Intelligence
- **Correlation Pattern Engine** — Weekly AI-generated insight cards. "Sleep quality drops on days caffeine exceeds 300mg." "Recovery improves when hydration exceeds 1.5 gallons." Cross-references lifestyle logs, dose logs, and check-in scores. Runs as a scheduled Supabase Edge Function, surfaces on the Insights tab.
- **Protocol Timeline** — Visual monthly report: protocol start date, biometric changes, adherence over time, weight trend. Like Flo's cycle view but for peptide stacks. Lives on the Insights tab.

## Phase 4 — Community
- **Journal Layer** — Per-day reflection attached to the daily check-in. AI summarizes patterns monthly: "Your energy scores improved 40% in week 2 of BPC-157." Private by default, shareable optionally.
- **Community Feed** — Anonymous protocol sharing. Mini Reddit: post your stack, results, questions. AI-moderated. Read-only for free users.

## Phase 5 — Expansion
- **Telehealth / Provider Directory** — Find verified clinics, med spas, and compounding pharmacies. Filter by location, specialty, peptide availability. User's top stated priority for next major feature after App Store launch.
- **Food Scan / Nutrition** — Camera-based food logging (like CalAI). Integrates with daily check-in energy and recovery scores to show nutrition → performance correlations.
