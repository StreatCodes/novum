import { Next, ParameterizedContext } from "koa";
import { ContextState } from ".";
import { APubActivity, APubNote, APubOrderedCollection } from "./activity-pub";
import { addFollower, addItemToInbox, getActorById, getInboxItems } from "./database";

export const postInboxHandler = (ctx: ParameterizedContext<ContextState>, next: Next) => {
    const db = ctx.state.db;
    const username = ctx.params.username;

    const data: APubActivity = ctx.request.body;

    switch (data.type) {
        case 'Create':
            if (data.object?.type !== 'Note') {
                console.log("Can't create inbox item - Unknown object type:", data);
                ctx.response.status = 501;
                return
            }

            addItemToInbox(db, {
                actor_id: username,
                id: data.id,
                type: data.object?.type,
                content: data.object.content,
                received: new Date().toISOString(),
                attributedTo: data.object.attributedTo
            });

            ctx.response.status = 200;
            break;
        case 'Follow':
            console.log('Received follow:', data)
            // addFollower(db, {
            //     data
            // });

            ctx.response.status = 200;
            break;
        default:
            console.log('Received unknown inbox request:', data)
            ctx.response.status = 501;
            break;
    }

    ctx.response.type = 'application/activity+json';
    return;
};

export const getInboxHandler = (ctx: ParameterizedContext<ContextState>, next: Next) => {
    const db = ctx.state.db;
    const username = ctx.params.username;

    const userExists = getActorById(db, username);
    if (!userExists) {
        ctx.response.status = 404;
        return;
    }
    const items = getInboxItems(db, username);

    const collection: APubOrderedCollection = {
        "@context": "https://www.w3.org/ns/activitystreams",
        summary: `${username}'s notes`,
        type: "OrderedCollection",
        totalItems: items.length,
        orderedItems: items
    }

    ctx.response.type = 'application/activity+json';
    ctx.response.body = JSON.stringify(collection);
}