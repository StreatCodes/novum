import test from 'node:test';
import assert from 'node:assert/strict';
import { addFollower, addItemToInbox, createActor, getFollowers, getInboxItems, initTestDB } from '../database.ts';
import { initServer } from '../server.ts';
import type { APubFollower, APubNote, APubOrderedCollection } from '../activity-pub.ts';

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
    const items = collection.orderedItems as APubNote[];
    assert.equal(collection.totalItems, 1);
    assert.equal(items[0].type, 'Note');
    assert.equal(items[0].content, 'Example note');
    assert.equal(items[0].attributedTo, 'https://example.com/actor/anotheruser');
    assert.equal(items[0].id, 'https://example.com/actor/testuser/note/1');
});

test('A follow sent to an actor\'s inbox should appear in the followers table', async (t) => {
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
            type: 'Follow',
            id: 'https://example.com/d2420d2f-46c4-4c25-bda6-7b3f90733b0c',
            actor: 'https://example.com/actor/anotheruser',
            object: 'http://localhost:9999/actor/testuser'
        })
    });
    assert.equal(res.status, 200);

    const followers = getFollowers(db, 'testuser');
    assert.equal(followers.length, 1);
    assert.equal(followers[0].id, 'https://example.com/d2420d2f-46c4-4c25-bda6-7b3f90733b0c');
    assert.equal(followers[0].actor_id, 'testuser');
    assert.equal(followers[0].follower_id, 'https://example.com/actor/anotheruser');
});

test('An actor followed by another actor should be listed in their followers', async (t) => {
    const db = await initTestDB();
    t.after(() => db.close());
    createActor(db, {
        id: 'testuser',
        preferred_username: 'Test User',
        summary: 'A test user'
    });
    const server = initServer(db, 'localhost', 9999, 'https://example.com');
    t.after(() => server.close());

    addFollower(db, {
        id: 'https://example.com/d2420d2f-46c4-4c25-bda6-7b3f90733b0c',
        actor_id: 'testuser',
        follower_id: 'https://example.com/actor/anotheruser',
        received: new Date().toISOString()
    });

    const res = await fetch('http://localhost:9999/actor/testuser/followers');
    assert.equal(res.status, 200);

    const collection: APubOrderedCollection = await res.json();
    const items = collection.orderedItems as APubFollower[];
    assert.equal(collection.totalItems, 1);
    assert.equal(items[0], 'https://example.com/actor/anotheruser');
});

test('An actor unfollowed by another actor should be removed from their followers', async (t) => {
    const db = await initTestDB();
    t.after(() => db.close());
    createActor(db, {
        id: 'testuser',
        preferred_username: 'Test User',
        summary: 'A test user'
    });
    const server = initServer(db, 'localhost', 9999, 'https://example.com');
    t.after(() => server.close());

    addFollower(db, {
        id: 'https://example.com/d2420d2f-46c4-4c25-bda6-7b3f90733b0c',
        actor_id: 'testuser',
        follower_id: 'https://example.com/actor/anotheruser',
        received: new Date().toISOString()
    });

    const followers = getFollowers(db, 'testuser');
    assert.equal(followers.length, 1);

    const res = await fetch('http://localhost:9999/actor/testuser/inbox', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/activity+json'
        },
        body: JSON.stringify({
            "@context": "https://www.w3.org/ns/activitystreams",
            type: 'Undo',
            id: 'https://example.com/actor/testuser/follows/39924087/undo',
            actor: 'https://example.com/actor/anotheruser',
            object: {
                id: 'https://example.com/d2420d2f-46c4-4c25-bda6-7b3f90733b0c',
                type: 'Follow',
                actor: 'https://example.com/actor/anotheruser',
                object: 'https://example.com/actor/testuser'
            }
        })
    });
    assert.equal(res.status, 200);

    const updatedFollowers = getFollowers(db, 'testuser');
    assert.equal(updatedFollowers.length, 0);
});