import { Next, ParameterizedContext } from "koa";
import { ContextState } from ".";
import { APubOrderedCollection } from "./activity-pub";
import { getActorById, getFollowers, getInboxItems } from "./database";

export const getFollowersHandler = (ctx: ParameterizedContext<ContextState>, next: Next) => {
    const db = ctx.state.db;
    const username = ctx.params.username;

    const userExists = getActorById(db, username);
    if (!userExists) {
        ctx.response.status = 404;
        return;
    }
    const items = getFollowers(db, username);
    const followers = items.map((item) => item.follower_id);

    const collection: APubOrderedCollection = {
        "@context": "https://www.w3.org/ns/activitystreams",
        summary: `${username}'s notes`,
        type: "OrderedCollection",
        totalItems: items.length,
        orderedItems: followers
    }

    ctx.response.type = 'application/activity+json';
    ctx.response.body = JSON.stringify(collection);
}