# Decisions

Decision memory for echo-bat (ADR-lite). Status: **Accepted · Open · Proposed · Superseded**.
Never silently rewrite history — supersede and link. Dates are absolute (YYYY-MM-DD).

---

## 0001 — Own standalone repo, split from the star-charter monorepo
**Status:** Accepted (2026-06-23)

**Context.** Echo Bat shipped inside the `star-charter` repo alongside Star Charter
and Star Charter Pro — three games in one repo, which made the project list hard to read.

**Decision.** Promote Echo Bat to its own standalone repo (`echo-bat`) with the full
doc set, following the new-project convention. `star-charter` keeps the combined history.

**Consequence.** One repo = one game; cleaner portfolio mapping. History before the split
lives in `star-charter`; this repo starts fresh with a pointer back.

---

## 0002 — Single file, zero dependencies
**Status:** Accepted (2026-06-23)

**Context.** The game is small and should run anywhere offline.

**Decision.** Keep everything in one `index.html` — procedural WebAudio, no asset files, no build.

**Consequence.** Trivial to host/share; nothing to install. Splitting into modules is deferred
until it actually hurts.

---

## 0003 — Standard modules as script files; supersedes 0002's single file
**Status:** Accepted (2026-10-10, owner: game-standards retrofit, all nine Cabinet games)

**Context.** The game-systems law (`AI-Brain\instructions\game-systems-law.md`, GAME-17 to GAME-19)
binds every game. The reference modules live once in `reference\game-std`; a game copies them into
`src/std/`. Inlining them into `index.html` would be a second copy that drifts from the reference.

**Decision.** `index.html` stays the shell and the game; `src/std/` holds the copied modules;
`config/game.json` holds the keys, the step cap and the intent map, with `config/game.js` generated
from it by `tools/build-config.mjs` so the game still opens from disk with no fetch. The watchdog is
the first script. Zero dependencies stays true.

**Consequence.** No existing save, best score or setting is lost: the save key `echoBatSave` and the
settings key `echo-bat.settings` keep their names; the unversioned save is read as version 0 and
migrated in place. Slices: (1) watchdog, config, save; (2) tick; (3) intents. Gate for each: the game
runs from disk, the old save loads, the owner play-tests. The monorepo copy is refreshed at the end.

**Change log.**
- 2026-10-10: slice 1 built: watchdog first, config twin, the standard save with the version-0 migration, the dev menu on the colophon. Proven live: a seeded unversioned save loaded with best 41, level 7, muted; the next write carried version 1; 3 Node tests; zero errors in the log.
- 2026-10-10: slice 2 built: the standard tick owns the loop; the game script requests no frame of its own; raw timers remain only inside the Audio object (allow-list). 6 Node tests; the bat still flies the title.
- 2026-10-10: slice 3 built: intents from config through the standard input; one marked device layer (pointer capture, audio gesture, hover flag, touch guard); edge intents handled at the top of every step. Proven live: Enter starts, arrows steer, P pauses, zero errors. 9 Node tests. Awaiting the owner play-test; the monorepo copy is refreshed after it.
- 2026-10-11: the owner play-tested slices 1 to 3 and passed them ("echo bat is good"). The retrofit gate is closed.
- 2026-10-11: slice 4 built, after the play-test: GAME-17 clause 9 (game-standards CR-2026-10-11-A, owner approved). `src/std/save.js` is the reference copy again, byte for byte: a stored save from a newer version is not migrated, not merged, not written and not removed; the session runs in memory and the title shows one line. The default save moved to `config.save.defaults`; `tools/save-shape.mjs` joins the gate and fails when the shape changes and `save.version` does not. Proven live on a spare origin: a seeded version 2 save showed the line, the watchdog logged `save_newer_version`, and the stored text was the same after the mute key; in a normal session the same key wrote the save and the line stayed hidden. 16 Node tests; three seeded faults each caught (the old module put back, the page id misspelt, a field added with no version change). Not play-tested by the owner. The monorepo copy is not refreshed yet.
