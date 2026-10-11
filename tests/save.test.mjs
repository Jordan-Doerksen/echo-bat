// The old echoBatSave loads through the standard save module (GAME-17). Run: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
function load() {
  const w = { window: null, localStorage: null };
  w.window = w; w.globalThis = w;
  vm.createContext(w);
  for (const f of ['src/std/save.js', 'src/save-migrations.js']) vm.runInContext(readFileSync(join(root, f), 'utf8'), w, { filename: f });
  return w;
}
const cfg = JSON.parse(readFileSync(join(root, 'config', 'game.json'), 'utf8'));
const store = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }; };
const make = (w, s, report) => w.GameStd.createSave({ key: cfg.save.key, settingsKey: cfg.save.settingsKey, version: cfg.save.version, store: s, defaults: cfg.save.defaults, settingsDefaults: { sfx: true, music: true }, migrations: w.EB_MIGRATIONS, report: report || (() => {}) });

test('the shipped, unversioned save loads with its best, bestLevel and muted intact', () => {
  const w = load(), s = store();
  s.setItem('echoBatSave', JSON.stringify({ best: 41, bestLevel: 7, muted: true }));
  s.setItem('echo-bat.settings', JSON.stringify({ sfx: false, music: true }));
  const save = make(w, s);
  assert.equal(save.migratedFrom, 0);
  assert.deepEqual(JSON.parse(JSON.stringify(save.data)), { best: 41, bestLevel: 7, muted: true, waits: {} });
  assert.deepEqual(JSON.parse(JSON.stringify(save.settings)), { sfx: false, music: true });
  assert.ok(save.write());
  assert.equal(JSON.parse(s.getItem('echoBatSave')).version, 1);
  assert.equal(JSON.parse(s.getItem('echoBatSave')).best, 41);
});

test('a fresh device starts at the defaults and the keys keep their shipped names', () => {
  const w = load(), s = store();
  const save = make(w, s);
  assert.equal(save.fresh, true);
  assert.equal(save.data.best, 0);
  assert.ok(save.write());
  assert.ok(s.getItem('echoBatSave'));
  assert.equal(cfg.save.key, 'echoBatSave');
  assert.equal(cfg.save.settingsKey, 'echo-bat.settings');
});

test('a NaN best is refused and the last good save stays', () => {
  const w = load(), s = store(), reports = [];
  const save = make(w, s, (e, c) => reports.push([e, c]));
  save.data.best = 12; assert.ok(save.write());
  save.data.best = NaN; assert.equal(save.write(), false);
  assert.equal(JSON.parse(s.getItem('echoBatSave')).best, 12);
  assert.equal(reports.at(-1)[0], 'save_invalid');
});

// GAME-17 clause 9. A release is reverted, or an older copy is opened: the stored save is newer
// than this game. It must still be there, byte for byte, when the newer game returns.
test('an echoBatSave from a newer version is left untouched; the session runs in memory', () => {
  const w = load(), s = store(), reports = [];
  const newer = JSON.stringify({ version: cfg.save.version + 1, best: 88, bestLevel: 12, muted: true, relics: ['moth'] });
  s.setItem('echoBatSave', newer);
  const save = make(w, s, (e, c) => reports.push([e, JSON.parse(JSON.stringify(c))]));
  assert.deepEqual(JSON.parse(JSON.stringify(save.newer)), { found: cfg.save.version + 1, expected: cfg.save.version });
  assert.deepEqual(reports, [['save_newer_version', { key: 'echoBatSave', found: cfg.save.version + 1, expected: cfg.save.version }]]);
  assert.equal(save.data.best, 0);
  save.data.best = 5;
  assert.ok(save.write());
  save.reset();
  assert.equal(s.getItem('echoBatSave'), newer);
  save.settings.sfx = false;
  assert.ok(save.writeSettings());
  assert.equal(JSON.parse(s.getItem('echo-bat.settings')).sfx, false);
});
