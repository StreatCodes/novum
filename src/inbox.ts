import { Database } from "better-sqlite3";
import { RequestHandler } from "express";

interface APubOrderedCollection {
    "@context": "https://www.w3.org/ns/activitystreams",
    summary: string,
    type: "OrderedCollection",
    totalItems: number,
    orderedItems: APubNote[]
}

interface APubActivity {
    "@context": "https://www.w3.org/ns/activitystreams",
    actor: string,
    id: string,
    type: 'Create' | 'Follow',
    published?: string,
    to?: string,
    object?: APubNote
}

interface APubNote {
    type: 'Note',
    id?: string,
    content?: string,
    name?: string,
    conversation?: string,
    published?: string,
    summary?: string,
    to?: string,
    url?: string
}

interface DBActivity {
    id: string,
    actor_id: string,
    type: string,
    data: string
}

export const postInboxHandler: RequestHandler = (req, res) => {
    const db: Database = req.app.locals.db;
    const username = req.params.username;

    const data: APubActivity = req.body;

    if (data.type !== 'Create' && data.type !== 'Follow') {
        res.sendStatus(501);
        return;
    }

    const stmt = db.prepare('INSERT INTO activities (id, actor_id, type, data) VALUES (?, ?, ?, ?)');
    stmt.run(data.id, username, data.type, JSON.stringify(data));
    res.type('application/activity+json');
    res.sendStatus(200);
};

export const getInboxHandler: RequestHandler = (req, res) => {
    const db: Database = req.app.locals.db;
    const username = req.params.username;

    const stmt = db.prepare(`SELECT * FROM activities WHERE actor_id = ? AND type='Create'`);
    const results = stmt.get(username) as DBActivity[];
    const notes = results
        .map((activity) => JSON.parse(activity.data) as APubActivity)
        .filter(activity => !!activity.object)
        .map(activity => activity.object as APubNote);

    const collection: APubOrderedCollection = {
        "@context": "https://www.w3.org/ns/activitystreams",
        summary: `${username}'s notes`,
        type: "OrderedCollection",
        totalItems: results.length,
        orderedItems: notes
    }

    res.type('application/activity+json');
    res.send(collection);
}