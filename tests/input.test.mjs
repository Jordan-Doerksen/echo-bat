// GAME-19: the rules read intents, never a key code or a pointer event. Run: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const strip = (t) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
const html = readFileSync(join(root, 'index.html'), 'utf8');
const game = html.slice(html.lastIndexOf('<script>'), html.lastIndexOf('</script>'));
const cfg = JSON.parse(readFileSync(join(root, 'config', 'game.json'), 'utf8'));

// The one marked block that may touch the device: pointer capture, the audio gesture, the hover flag.
const devStart = game.indexOf('// DEVICE LAYER');
const devEnd = game.indexOf('// END DEVICE LAYER');
const rules = strip(game.slice(0, devStart) + game.slice(devEnd));

test('the device layer is one marked block and the input module is loaded', () => {
  assert.ok(devStart > 0 && devEnd > devStart, 'DEVICE LAYER ... END DEVICE LAYER is present once');
  assert.ok(html.includes('<script src="src/std/input.js"></script>'));
  assert.match(rules, /GameStd\.createInput\s*\(/);
});

test('outside the device layer, no key code, key map or pointer event is read', () => {
  assert.doesNotMatch(rules, /\bKEYMAP\b/);
  assert.doesNotMatch(rules, /\b(e|ev|evt|event)\.(code|key|keyCode|which|button|buttons|pointerId|pointerType|clientX|clientY)\b/);
  assert.doesNotMatch(rules, /['"](keydown|keyup|pointerdown|pointerup|pointermove|pointercancel|touchstart|touchend|mousedown|mouseup)['"]/);
  assert.doesNotMatch(rules, /\b(Key[A-Z]|Arrow(Up|Down|Left|Right)|Digit[0-9]|Space|Escape|Enter)\b/);
});

test('every intent the rules read is named in config', () => {
  const named = new Set(cfg.input.intents);
  const seen = new Set();
  for (const m of rules.matchAll(/\bINPUT\.(?:held\.(\w+)|pressed\(['"](\w+)['"]\))/g)) {
    const intent = m[1] || m[2];
    seen.add(intent);
    assert.ok(named.has(intent), `intent "${intent}" is not in config.input.intents`);
  }
  for (const i of ['up', 'down', 'left', 'right', 'fly', 'pause', 'mute', 'confirm', 'choose1']) assert.ok(seen.has(i), `the rules read ${i}`);
});
