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
