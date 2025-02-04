import Koa, { type ParameterizedContext } from 'koa';
import Router from '@koa/router';
import type { Database } from "better-sqlite3";
import { bodyParser } from "@koa/bodyparser";
import { handleWebfinger as getWebfinger } from './webfinger.ts';
import { actorHandler as getApubActor } from './activity-pub/actor.ts';
import { postInboxHandler as postApubInbox } from './activity-pub/inbox.ts';
import { getFollowersHandler as getApubFollowers } from './activity-pub/follows.ts';
import { getIndex } from './web/index.ts';
import { compileTemplates } from './web/template.ts';
import { getLogin, postLogin } from './web/login.ts';
import { getFileHandler } from './web/file-handler.ts';
import { getRegister, postRegister } from './web/register.ts';
import { getSearch } from './web/search.ts';
import { getUser } from './web/user.ts';
import type { ContextState } from './index.ts';

export async function initServer(db: Database, listenAddr: string, listenPort: number, publicUrl?: string) {
    const app = new Koa();
    const router = new Router();

    //APub handles
    router.get('/.well-known/webfinger', getWebfinger);
    router.get('/actor/:username', getApubActor);
    router.post('/actor/:username/inbox', postApubInbox);
    router.get('/actor/:username/followers', getApubFollowers);

    //Web handles
    router.get('/', getIndex);
    router.get('/@:handle', getUser);
    router.get('/login', getLogin)
    router.post('/login', postLogin)
    router.get('/register', getRegister)
    router.post('/register', postRegister)
    router.get('/search', getSearch)

    //File handler
    router.get(/res\/.*/, getFileHandler)

    app.use(bodyParser({
        encoding: undefined,
        extendTypes: {
            json: ['application/activity+json', 'application/json']
        }
    }));
    app.use(async (ctx: ParameterizedContext<ContextState>, next) => {
        ctx.state.db = db;
        ctx.state.host = publicUrl;
        await next();
    });
    app.use(router.routes());
    app.use(router.allowedMethods());

    await compileTemplates('src/web/templates');

    return app.listen(listenPort, listenAddr);
}