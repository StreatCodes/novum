import test from 'node:test';
import assert from 'node:assert/strict';
import { createActor, initTestDB } from '../database.ts';
import { initServer } from '../server.ts';
import type { WebfingerResponse } from '../webfinger.ts';

test('Webfinger to missing entity should return 404', async (t) => {
    const db = await initTestDB();
    const server = initServer(db, 'localhost', 9999, 'https://example.com');
    t.after(() => server.close());

    const res = await fetch('http://localhost:9999/.well-known/webfinger?resource=acct:mort@example.com')
    assert.equal(res.status, 404);
});

test('Webfinger to known entity should return 200', async (t) => {
    const db = await initTestDB();
    createActor(db, {
        id: 'testuser',
        preferred_username: 'Test User',
        summary: 'A test user'
    });
    const server = initServer(db, 'localhost', 9999, 'https://example.com');
    t.after(() => server.close());

    const res = await fetch('http://localhost:9999/.well-known/webfinger?resource=acct:testuser@example.com')
    const data: WebfingerResponse = await res.json();

    assert.equal(res.status, 200);
    assert.equal(data.subject, 'acct:testuser@example.com');
    assert.equal(data.links[0].type, 'application/activity+json');
    assert.equal(data.links[0].href, 'https://example.com/actor/testuser');
});