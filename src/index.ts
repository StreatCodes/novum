import express from 'express';
import Sqlite from 'better-sqlite3';
import { handleWebfinger } from './webfinger';
import { actorHandler } from './actor';
import { Server } from "http";
import { URL } from 'url';
import { inboxHandler } from './inbox';

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

const app = express();
app.locals.db = db;
app.use(express.json({
    type: ['application/activity+json', 'application/ld+json', 'application/json']
}));
app.get('/.well-known/webfinger', handleWebfinger);
app.get('/actor/:username', actorHandler);
app.post('/actor/:username/inbox', inboxHandler);

const url = new URL(`http://${host}:${port}/`);
console.log(`Server running at http://${url.hostname}:${url.port}/`);

app.locals.host = publicUrl || url.origin;
server = app.listen(Number(url.port), url.hostname);