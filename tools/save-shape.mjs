#!/usr/bin/env node
// GAME-17 clause 1: the save version rises when the shape of the default save changes. An older
// copy of the game tells a newer save from its own by the version alone (clause 9), so a shape
// change with no version change is a save that an older copy overwrites without a report.
//
// The shape is one line for each leaf of config/game.json save.defaults, "path:type", sorted. The
// fingerprint is a hash of those lines. save.shape records the pair { version, fingerprint }.
//
//   node tools/save-shape.mjs            prints the pair to record, and the shape lines
//   node tools/save-shape.mjs --check    exit 0 GREEN, 1 RED, 2 COULD-NOT-LOOK
//   --config <file>                      reads another config file (the tests use it)
//
// Limit: this sees a field that is added, removed, renamed or changed in type. It does not see a
// field that keeps its shape and changes its meaning. Zero dependencies.
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const args = process.argv.slice(2);
const at = args.indexOf('--config');
const file = at >= 0 && args[at + 1] ? resolve(args[at + 1]) : join(dirname(fileURLToPath(import.meta.url)), '..', 'config', 'game.json');
const stop = (code, line) => { (code === 0 ? console.log : console.error)(line); process.exit(code); };

if (!existsSync(file)) stop(2, `COULD-NOT-LOOK: ${file} is missing`);
let cfg;
try { cfg = JSON.parse(readFileSync(file, 'utf8')); } catch (e) { stop(2, `COULD-NOT-LOOK: ${file} is not valid JSON: ${e.message}`); }

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const save = cfg.save;
if (!isObj(save) || !isObj(save.defaults)) stop(2, 'COULD-NOT-LOOK: config save.defaults is missing; the default save must live in config so this check can read it');
if (!Number.isInteger(save.version) || save.version < 1) stop(1, 'RED: config save.version must be a whole number, 1 or more');

// An array is one leaf: its items are not part of the shape. An empty object is one leaf too, so
// an open map such as waits has a line.
function lines(v, path) {
  if (Array.isArray(v)) return [`${path}:array`];
  if (v === null) return [`${path}:null`];
  if (!isObj(v)) return [`${path}:${typeof v}`];
  const keys = Object.keys(v).sort();
  if (keys.length === 0) return [`${path}:object`];
  return keys.flatMap((k) => lines(v[k], path ? `${path}.${k}` : k));
}
const shape = lines(save.defaults, '').sort();
const fingerprint = createHash('sha256').update(shape.join('\n')).digest('hex').slice(0, 16);
const pair = (version) => `"shape": { "version": ${version}, "fingerprint": "${fingerprint}" }`;

if (!args.includes('--check')) {
  console.log(pair(save.version));
  for (const l of shape) console.log('  ' + l);
  process.exit(0);
}

const rec = save.shape;
if (!isObj(rec) || !Number.isInteger(rec.version) || typeof rec.fingerprint !== 'string') {
  stop(1, `RED: config save.shape is missing or incomplete. Record ${pair(save.version)} in save, then run npm run build`);
}
if (save.version < rec.version) stop(1, `RED: save.version is ${save.version} and save.shape records version ${rec.version}. A save version does not go down.`);
if (save.version > rec.version) {
  stop(1, `RED: save.version is ${save.version} and save.shape still records version ${rec.version}. Confirm that migration step ${rec.version} exists in the createSave call, record ${pair(save.version)} in save, then run npm run build`);
}
if (rec.fingerprint !== fingerprint) {
  stop(1, `RED: the default save changed shape and save.version is still ${save.version}. Raise save.version to ${save.version + 1}, add migration step ${save.version} to the createSave call, record ${pair(save.version + 1)} in save, then run npm run build`);
}
stop(0, `GREEN: the default save matches the shape recorded for version ${save.version}`);
