# Changelog

Phase log for echo-bat. Newest first. Absolute dates (YYYY-MM-DD).

## 2026-07-14 — Sound settings
- Settings panel (title + pause): separate Sound-effects and Music toggles,
  persisted under `echo-bat.settings` — the `echoBatSave` key is untouched.
  Defaults both ON; HUD ♪ button stays the master mute on top.
- Audio routing: new music bus (dry gain for the drone, wet gain for the
  bells/drips send into the echo chamber) so MUSIC off leaves SFX their echo;
  `tone()`/`noise()` gate on the SFX setting. No new sounds — the game's
  chirps, fruit/hit/death/level/gift/owl SFX and cave-ambience music were
  already complete and are unchanged.
- Drift-synced archive-nav links from the live monorepo copy (relative URLs).

## 2026-06-23 — Standalone repo
- Split/scaffolded into its own repo with README + docs (HANDOFF/SPEC/DECISIONS/CHANGELOG),
  MIT LICENSE, and .gitignore, per the new-project convention.
- Game itself is the existing shipped build, carried in unchanged.
