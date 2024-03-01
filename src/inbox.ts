import { Next, ParameterizedContext } from "koa";
import { ContextState } from ".";

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

export const postInboxHandler = (ctx: ParameterizedContext<ContextState>, next: Next) => {
    const db = ctx.state.db;
    const username = ctx.query['username'];

    const data: APubActivity = ctx.request.body;

    if (data.type !== 'Create' && data.type !== 'Follow') {
        ctx.response.status = 501;
        return;
    }

    const stmt = db.prepare('INSERT INTO activities (id, actor_id, type, data) VALUES (?, ?, ?, ?)');
    stmt.run(data.id, username, data.type, JSON.stringify(data));

    ctx.response.type = 'application/activity+json';
    ctx.response.status = 200;
};

export const getInboxHandler = (ctx: ParameterizedContext<ContextState>, next: Next) => {
    const db = ctx.state.db;
    const username = ctx.query['username'];

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

    ctx.response.type = 'application/activity+json';
    ctx.response.body = JSON.stringify(collection);
}