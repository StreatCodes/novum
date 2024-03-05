import test from 'node:test';
import assert from 'node:assert/strict';
import { addItemToInbox, createActor, getInboxItems, initTestDB } from '../database';
import { initServer } from '../server';
import { APubOrderedCollection } from '../activity-pub';

test('Non existant inbox should 404', async (t) => {
    const db = await initTestDB();
    t.after(() => db.close());
    const server = initServer(db, 'localhost', 9999, 'https://example.com');
    t.after(() => server.close());

    const res = await fetch('http://localhost:9999/actor/nonexistant/inbox')
    assert.equal(res.status, 404);
});

test('Sending a Note to an actor should store the note in the inbox table', async (t) => {
    const db = await initTestDB();
    t.after(() => db.close());
    createActor(db, {
        id: 'testuser',
        preferred_username: 'Test User',
        summary: 'A test user'
    });
    const server = initServer(db, 'localhost', 9999, 'https://example.com');
    t.after(() => server.close());

    const res = await fetch('http://localhost:9999/actor/testuser/inbox', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/activity+json'
        },
        body: JSON.stringify({
            "@context": "https://www.w3.org/ns/activitystreams",
            type: 'Create',
            id: 'https://example.com/actor/testuser/note/1',
            object: {
                to: 'https://example.com/actor/testuser',
                type: 'Note',
                content: 'Hello, world!',
                attributedTo: 'https://example.com/actor/anotheruser'
            }
        })
    });

    assert.equal(res.status, 200);

    const items = getInboxItems(db, 'testuser');
    assert.equal(items.length, 1);
    assert.equal(items[0].type, 'Note');
    assert.equal(items[0].content, 'Hello, world!');
    assert.equal(items[0].attributedTo, 'https://example.com/actor/anotheruser');
});

test('A Note assigned to an actor should be listed in their inbox', async (t) => {
    const db = await initTestDB();
    t.after(() => db.close());
    createActor(db, {
        id: 'testuser',
        preferred_username: 'Test User',
        summary: 'A test user'
    });
    const server = initServer(db, 'localhost', 9999, 'https://example.com');
    t.after(() => server.close());

    addItemToInbox(db, {
        actor_id: 'testuser',
        id: 'https://example.com/actor/testuser/note/1',
        type: 'Note',
        received: new Date().toISOString(),
        content: 'Example note',
        attributedTo: 'https://example.com/actor/anotheruser',
        published: new Date().toISOString()
    });

    const res = await fetch('http://localhost:9999/actor/testuser/inbox');
    assert.equal(res.status, 200);
    const collection: APubOrderedCollection = await res.json();
    assert.equal(collection.totalItems, 1);
    assert.equal(collection.orderedItems[0].type, 'Note');
    assert.equal(collection.orderedItems[0].content, 'Example note');
    assert.equal(collection.orderedItems[0].attributedTo, 'https://example.com/actor/anotheruser');
    assert.equal(collection.orderedItems[0].id, 'https://example.com/actor/testuser/note/1');
});