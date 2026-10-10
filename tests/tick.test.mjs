// GAME-18: one loop owns game time. Run: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const strip = (t) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
const html = readFileSync(join(root, 'index.html'), 'utf8');
const game = strip(html.slice(html.lastIndexOf('<script>'), html.lastIndexOf('</script>')));

test('the game script makes no animation frame of its own; src/std/tick.js owns the loop', () => {
  assert.doesNotMatch(game, /requestAnimationFrame\s*\(/);
  assert.doesNotMatch(game, /cancelAnimationFrame\s*\(/);
  assert.match(game, /GameStd\.createTick\s*\(/);
  assert.ok(html.includes('<script src="src/std/tick.js"></script>'));
});

test('raw timers in the game script live only inside the Audio object (GAME-18 clause 5 allow-list)', () => {
  const audioStart = game.indexOf('const Audio = {');
  const audioEnd = game.indexOf('\n};', audioStart) + 3;
  assert.ok(audioStart > 0 && audioEnd > audioStart, 'the Audio object is where it was');
  const outside = game.slice(0, audioStart) + game.slice(audioEnd);
  const cfg = JSON.parse(readFileSync(join(root, 'config', 'game.json'), 'utf8'));
  assert.deepEqual(cfg.tick.rawTimers, [], 'no raw timer is registered outside audio');
  assert.doesNotMatch(outside, /\b(setTimeout|setInterval)\s*\(/);
});

test('the step cap comes from config and is the one the shipped game used', () => {
  const cfg = JSON.parse(readFileSync(join(root, 'config', 'game.json'), 'utf8'));
  assert.equal(cfg.tick.maxStepMs, 50);
  assert.doesNotMatch(game, /Math\.min\(\(now - last\)/);
});
