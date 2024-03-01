import { Next, ParameterizedContext } from "koa";
import { ContextState } from ".";
import { APubActivity, APubNote, APubOrderedCollection } from "./activity-pub";
import { DBActivity, insertActivity } from "./database";

export const postInboxHandler = (ctx: ParameterizedContext<ContextState>, next: Next) => {
    const db = ctx.state.db;
    const username = ctx.params.username;

    const data: APubActivity = ctx.request.body;

    if (data.type !== 'Create' && data.type !== 'Follow') {
        ctx.response.status = 501;
        return;
    }

    insertActivity(db, username, data);

    ctx.response.type = 'application/activity+json';
    ctx.response.status = 200;
};

export const getInboxHandler = (ctx: ParameterizedContext<ContextState>, next: Next) => {
    const db = ctx.state.db;
    const username = ctx.params.username;

    //TODO
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