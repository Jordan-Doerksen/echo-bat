// GAME-17 clause 1: the save version rises when the shape of the default save changes. This runs
// tools/save-shape.mjs on the real config, then on copies with one seeded fault each, so the
// check is proven to fail and not only to pass. Adapted from the game-std template: Echo Bat
// keeps its boot code in index.html, so the page test reads that one file.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const tool = join(root, 'tools', 'save-shape.mjs');
const real = join(root, 'config', 'game.json');
const check = (file) => spawnSync(process.execPath, [tool, '--check', '--config', file], { encoding: 'utf8' });

// Runs the check on a copy of the real config after `change` has edited it.
function withConfig(change) {
  const dir = mkdtempSync(join(tmpdir(), 'save-shape-'));
  try {
    const cfg = JSON.parse(readFileSync(real, 'utf8'));
    change(cfg);
    const file = join(dir, 'game.json');
    writeFileSync(file, JSON.stringify(cfg));
    return check(file);
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

test('the default save matches the shape recorded for its version', () => {
  const r = check(real);
  assert.equal(r.status, 0, r.stderr || r.stdout);
});

test('a field added, removed, renamed or retyped with no version change is RED', () => {
  const added = withConfig((c) => { c.save.defaults.relics = []; });
  assert.equal(added.status, 1);
  assert.match(added.stderr, /changed shape/);
  assert.equal(withConfig((c) => { delete c.save.defaults.bestLevel; }).status, 1);
  assert.equal(withConfig((c) => { c.save.defaults.score = c.save.defaults.best; delete c.save.defaults.best; }).status, 1);
  assert.equal(withConfig((c) => { c.save.defaults.muted = 0; }).status, 1);
});

test('a new default value with the same shape is not a shape change', () => {
  assert.equal(withConfig((c) => { c.save.defaults.best = 10; }).status, 0);
});

test('a version raised with no new record is RED, and so is a version that goes down', () => {
  const up = withConfig((c) => { c.save.version += 1; });
  assert.equal(up.status, 1);
  assert.match(up.stderr, /still records version/);
  const down = withConfig((c) => { c.save.shape.version += 1; });
  assert.equal(down.status, 1);
  assert.match(down.stderr, /does not go down/);
});

// GAME-17 clause 9, the page side. A wrong id here throws at boot, and only in the rare session
// that holds a newer save, so nobody would see it in a play-test.
test('the newer-save line is in the page, hidden, and the boot code shows it', () => {
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  assert.match(html, /<p[^>]*id="newerNote"[^>]*hidden[^>]*>[^<]*newer version[^<]*<\/p>/);
  assert.match(html, /if \(SAVE\.newer\) \$\('newerNote'\)\.hidden = false;/);
  assert.match(html, /defaults: CFG\.save\.defaults,/);
});

test('no record is RED; no default save in config is could-not-look, which is not a pass', () => {
  assert.equal(withConfig((c) => { delete c.save.shape; }).status, 1);
  assert.equal(withConfig((c) => { delete c.save.defaults; }).status, 2);
});
