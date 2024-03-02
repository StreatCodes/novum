import Koa from 'koa';
import Router from '@koa/router';
import { Database } from "better-sqlite3";
import { bodyParser } from "@koa/bodyparser";
import { handleWebfinger } from './webfinger';
import { actorHandler } from './actor';
import { getInboxHandler, postInboxHandler } from './inbox';

export function initServer(db: Database, listenAddr: string, listenPort: number, publicUrl?: string) {
    const app = new Koa();
    const router = new Router();

    router.get('/.well-known/webfinger', handleWebfinger);
    router.get('/actor/:username', actorHandler);
    router.post('/actor/:username/inbox', postInboxHandler);
    router.get('/actor/:username/inbox', getInboxHandler);


    app.use(async (ctx, next) => {
        ctx.state.db = db;
        ctx.state.host = publicUrl;
        await next();
    });
    app.use(router.routes());
    app.use(router.allowedMethods());
    app.use(bodyParser());

    return app.listen(listenPort, listenAddr);
}