# echo-bat — Build Handoff

> Read SPEC.md first — it's the full design and tech spec.
> This file is the kickoff: how to stand up the repo and build it phase by phase.
> Home repo: `echo-bat` (C:\projects\echo-bat).

> **Progress (as built, 2026-06-23):** <one-line status — what's runnable, what's next.>

---

## What you're building
<2–4 sentences: the thing, who it's for, the one or two design decisions that matter most.>

## Stand up the repo
1. Repo: `echo-bat`. <free & open? enable GitHub Pages → <user>.github.io/echo-bat; MIT LICENSE.>
2. Pure static — no build step, no framework (default). `index.html` + `/src` (vanilla JS) + `/docs` (this folder) + `/tools` (any verifier).
3. <what to copy/reference from prior work — and what to re-implement clean rather than fork.>
4. Footer + how-to keep any honest disclaimer and cite sources where relevant.

## Architecture (keep it boring)
- `index.html` — shell + styles.
- `src/…` — small modules, one job each. (Start as one file; split when it hurts.)
- `tools/…` — verifiers/harnesses (Node/Python), not shipped.

## Build order (phased)
Each phase ships something runnable and verified before the next.
- **P0 — skeleton + the core action.** <smallest usable slice.>
- **P1 — …**
- **P2 — …**

## Definition of done (per phase/feature)
1. It runs and does the thing.
2. Any correctness claim has a check/harness that passes.
3. Docs updated (this file + CHANGELOG).
4. No secret in the repo; `.gitignore` covers `.env`.

## Source / citation quick-reference (if applicable)
| Thing | Source |
|---|---|
| … | … |

## Keep / Don't carry over
- **Keep:** <what worked before.>
- **Don't carry over:** <known mistakes to avoid repeating.>
