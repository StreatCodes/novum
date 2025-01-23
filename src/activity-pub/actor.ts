import type { Next, ParameterizedContext } from "koa";
import type { ContextState } from "../index.ts";
import { getActorById } from "../database.ts";
import type { APubActor } from "./activity-pub.ts";

export const actorHandler = (ctx: ParameterizedContext<ContextState>, next: Next) => {
    const db = ctx.state.db;
    const hostname = ctx.state.host;
    const username = ctx.params.username;

    const user = getActorById(db, username);

    if (!user) {
        ctx.response.status = 404;
        return;
    }

    const actor: APubActor = {
        "@context": "https://www.w3.org/ns/activitystreams",
        "type": "Person",
        "id": `${hostname}/actor/${user.id}`,
        "following": `${hostname}/actor/${user.id}/following`,
        "followers": `${hostname}/actor/${user.id}/followers`,
        "liked": `${hostname}/actor/${user.id}/liked`,
        "inbox": `${hostname}/actor/${user.id}/inbox`,
        "outbox": `${hostname}/actor/${user.id}/outbox`,
        "name": user.id,
        "summary": user.summary,
        "preferredUsername": user.preferred_username,
        "url": user.url,
        "icon": user.icon
    }

    ctx.response.type = 'application/activity+json';
    ctx.response.body = JSON.stringify(actor);
}