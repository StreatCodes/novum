import Koa from 'koa';
import Router from '@koa/router';
import Sqlite from 'better-sqlite3';
import { handleWebfinger } from './webfinger';
import { actorHandler } from './actor';
import { Server } from "http";
import { URL } from 'url';
import { getInboxHandler, postInboxHandler } from './inbox';
import { bodyParser } from '@koa/bodyparser';

export interface ContextState {
    db: Sqlite.Database;
    host: string;
}

let server: Server | undefined = undefined;
const db = new Sqlite('novum.db');

const host = process.argv[2];
const port = process.argv[3];
const publicUrl = process.argv[4];

if (!host) {
    console.error('Usage: node src/index.js <host> <port> <public_url>');
    console.error('host: The hostname to listen on (required)')
    console.error('port: The port to listen on')
    console.error('public_url: The publicly accessible URL (useful for reverse proxies)')
    console.error('Example: node src/index.js localhost 3000 https://novum.streats.dev')
    process.exit(1);
}

process.on('SIGINT', () => {
    server?.close();
    db.close();
});

const app = new Koa();
const router = new Router();

router.get('/.well-known/webfinger', handleWebfinger);
router.get('/actor/:username', actorHandler);
router.post('/actor/:username/inbox', postInboxHandler);
router.get('/actor/:username/inbox', getInboxHandler);

const url = new URL(`http://${host}:${port}/`);
console.log(`Server running at http://${url.hostname}:${url.port}/`);

app.use(async (ctx, next) => {
    ctx.state.db = db;
    ctx.state.host = publicUrl || url.origin;
    await next();
});
app.use(router.routes());
app.use(router.allowedMethods());
app.use(bodyParser());

server = app.listen(Number(url.port), url.hostname);