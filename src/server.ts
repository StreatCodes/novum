import Koa from 'koa';
import Router from '@koa/router';
import type { Database } from "better-sqlite3";
import { bodyParser } from "@koa/bodyparser";
import { handleWebfinger } from './webfinger.ts';
import { actorHandler } from './actor.ts';
import { getInboxHandler, postInboxHandler } from './inbox.ts';
import { getFollowersHandler } from './follows.ts';
import { handleIndex } from './web/index.ts';

export function initServer(db: Database, listenAddr: string, listenPort: number, publicUrl?: string) {
    const app = new Koa();
    const router = new Router();

    //APub handles
    router.get('/.well-known/webfinger', handleWebfinger);
    router.get('/actor/:username', actorHandler);
    router.post('/actor/:username/inbox', postInboxHandler);
    router.get('/actor/:username/inbox', getInboxHandler);
    router.get('/actor/:username/followers', getFollowersHandler);

    router.get('/', handleIndex)

    app.use(bodyParser({
        encoding: undefined,
        extendTypes: {
            json: ['application/activity+json', 'application/json']
        }
    }));
    app.use(async (ctx, next) => {
        ctx.state.db = db;
        ctx.state.host = publicUrl;
        await next();
    });
    app.use(router.routes());
    app.use(router.allowedMethods());

    return app.listen(listenPort, listenAddr);
}