import Koa from 'koa';
import Router from '@koa/router';
import type { Database } from "better-sqlite3";
import { bodyParser } from "@koa/bodyparser";
import { handleWebfinger as getWebfinger } from './webfinger.ts';
import { actorHandler as getApubActor } from './activity-pub/actor.ts';
import { getInboxHandler as getApubInbox, postInboxHandler as postApubInbox } from './activity-pub/inbox.ts';
import { getFollowersHandler as getApubFollowers } from './activity-pub/follows.ts';
import { getIndex } from './web/index.ts';
import { compileTemplates } from './web/template.ts';
import { getLogin } from './web/login.ts';
import { getFileHandler } from './web/file-handler.ts';

export async function initServer(db: Database, listenAddr: string, listenPort: number, publicUrl?: string) {
    const app = new Koa();
    const router = new Router();

    //APub handles
    router.get('/.well-known/webfinger', getWebfinger);
    router.get('/actor/:username', getApubActor);
    router.post('/actor/:username/inbox', postApubInbox);
    router.get('/actor/:username/inbox', getApubInbox);
    router.get('/actor/:username/followers', getApubFollowers);

    //Web handles
    router.get('/', getIndex);
    router.get('/login', getLogin)

    //File handler
    router.get(/res\/.*/, getFileHandler)

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

    await compileTemplates('src/web/templates');

    return app.listen(listenPort, listenAddr);
}