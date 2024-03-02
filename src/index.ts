import Sqlite from 'better-sqlite3';
import { URL } from 'url';
import { initServer } from './server';

export interface ContextState {
    db: Sqlite.Database;
    host: string;
}

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


const url = new URL(`http://${host}:${port}/`);
console.log(`Server running at http://${url.hostname}:${url.port}/`);

const server = initServer(db, url.hostname, Number(url.port), publicUrl || url.origin)

process.on('SIGINT', () => {
    server.close();
    db.close();
});