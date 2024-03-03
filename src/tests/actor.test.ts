import test from 'node:test';
import assert from 'node:assert/strict';
import { createActor, initTestDB } from '../database';
import { initServer } from '../server';
import { APubActor } from '../activity-pub';

test('Non existant actor should 404', async (t) => {
    const db = await initTestDB();
    const server = initServer(db, 'localhost', 9999, 'https://example.com');
    console.log('listen address', server.address());
    t.after(() => server.close());

    const res = await fetch('http://localhost:9999/actor/nonexistant')
    assert.equal(res.status, 404);
});

test('Fetching an existing actor should return 200', async (t) => {
    const db = await initTestDB();
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