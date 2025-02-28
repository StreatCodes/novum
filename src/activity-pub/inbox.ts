import type { Next, ParameterizedContext } from "koa";
import type { ContextState } from "../index.ts";
import type { APubActivity, APubFollower, APubNote, APubOrderedCollection } from "./activity-pub.ts";
import { addFollower } from "../database/index.ts";

export const postInboxHandler = (ctx: ParameterizedContext<ContextState>, next: Next) => {
    const db = ctx.state.db;
    const username = ctx.params.username;
    //TODO handle non-existant actor

    const data: APubActivity = ctx.request.body;

    switch (data.type) {
        case 'Create': {
            const object = data.object as APubNote;
            if (object.type !== 'Note') {
                console.log("Can't create inbox item - Unknown object type:", data);
                ctx.response.status = 501;
                return
            }

            // TODO
            // addItemToInbox(db, {
            //     actor_id: username,
            //     id: data.id,
            //     type: object.type,
            //     content: object.content,
            //     received: new Date().toISOString(),
            //     attributedTo: object.attributedTo
            // });

            ctx.response.status = 200;
            break;
        }
        case 'Follow': {
            const object = data.object as APubFollower;
            if (!object) {
                console.log("Can't add follower without object", data);
                ctx.response.status = 400;
                return
            }
            addFollower(db, {
                id: data.id,
                actor_id: username,
                follower_id: data.actor,
                received: new Date().toISOString()
            });

            ctx.response.status = 200;
            break;
        }
        case 'Undo': {
            // if ((data.object as any)?.type === 'Follow') {
            //     const object = data.object as APubFollow;
            //     deleteFollower(db, username, object.actor);
            //     ctx.response.status = 200;
            //     break;
            // }

            ctx.response.status = 501;
            break;
        }
        default:
            console.log('Received unknown inbox request:', data)
            ctx.response.status = 501;
            break;
    }

    ctx.response.type = 'application/activity+json';
    return;
};
