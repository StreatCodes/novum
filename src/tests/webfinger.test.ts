import test from 'node:test';
import assert from 'node:assert/strict';

test('synchronous passing test', (t) => {
    assert.strictEqual(1, 1);
});

test('synchronous fail test', (t) => {
    assert.strictEqual(1, 1);
});