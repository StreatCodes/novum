import test from 'node:test';
import assert from 'node:assert/strict';
import { createActor, initTestDB } from '../database.ts';
import { initServer } from '../server.ts';
import type { APubActor } from '../activity-pub/activity-pub.ts';

test('Non existant actor should 404', async (t) => {
    const db = await initTestDB();
    t.after(() => db.close());
    const server = initServer(db, 'localhost', 9999, 'https://example.com');
    t.after(() => server.close());

    const res = await fetch('http://localhost:9999/actor/nonexistant')
    assert.equal(res.status, 404);
});

test('Fetching an existing actor should return 200', async (t) => {
    const db = await initTestDB();
    t.after(() => db.close());
    createActor(db, {
        id: 'testuser',
        preferred_username: 'Test User',
        summary: 'A test user'
    });
    const server = initServer(db, 'localhost', 9999, 'https://example.com');
    t.after(() => server.close());

    const res = await fetch('http://localhost:9999/actor/testuser')
    const data: APubActor = await res.json();

    assert.equal(res.status, 200);
    assert.equal(data.type, 'Person');
    assert.equal(data.id, 'https://example.com/actor/testuser');
    assert.equal(data.following, 'https://example.com/actor/testuser/following');
    assert.equal(data.inbox, 'https://example.com/actor/testuser/inbox');
    assert.equal(data.name, 'testuser');
    assert.equal(data.preferredUsername, 'Test User');
    assert.equal(data.summary, 'A test user');
});