import { Database } from "better-sqlite3";
import { RequestHandler } from "express";

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

export const inboxHandler: RequestHandler = (req, res) => {
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