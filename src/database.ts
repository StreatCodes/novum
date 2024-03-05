import Sqlite, { Database } from "better-sqlite3";
import fs from 'node:fs/promises';

export async function initTestDB(): Promise<Database> {
    const seedSql = await fs.readFile('seed.sql', 'utf-8');
    const db = new Sqlite(':memory:');

    db.exec(seedSql);
    return db;
}

export interface DBActor {
    id: string,
    preferred_username?: string,
    summary?: string,
    icon?: string,
    url?: string
}

export function createActor(db: Database, actor: DBActor) {
    const stmt = db.prepare('INSERT INTO actors (id, preferred_username, summary, icon, url) VALUES (?, ?, ?, ?, ?)');
    stmt.run(actor.id, actor.preferred_username, actor.summary, actor.icon, actor.url);
}

export function getActorById(db: Database, actorId: string): DBActor | undefined {
    const stmt = db.prepare('SELECT * FROM actors WHERE id = ?');
    return stmt.get(actorId) as DBActor | undefined;
}

export interface DBInboxItem {
    id: string,
    actor_id: string,
    type: 'Note',
    content?: string,
    received: string,
    published?: string,
    attributedTo?: string
}

export function getInboxItems(db: Database, username: string): DBInboxItem[] {
    const stmt = db.prepare(`SELECT * FROM inbox WHERE actor_id = ?`);
    return stmt.all(username) as DBInboxItem[];
}

export function addItemToInbox(db: Database, item: DBInboxItem) {
    const stmt = db.prepare(`INSERT INTO inbox
    (id, actor_id, type, content, received, published, attributedTo)
    VALUES (?, ?, ?, ?, ?, ?, ?)`);
    stmt.run(item.id, item.actor_id, item.type, item.content, item.received, item.published, item.attributedTo);
}


export interface DBFollow {
    id: string,
    actor_id: string,
    received: string,
    published?: string,
    attributedTo?: string
}

export function getFollowers(db: Database, username: string): DBFollow[] {
    const stmt = db.prepare(`SELECT * FROM followers WHERE actor_id = ?`);
    return stmt.all(username) as DBFollow[];
}

export function addFollower(db: Database, follow: DBFollow) {
    // const stmt = db.prepare(`INSERT INTO followers
    // (TODO)
    // VALUES (?)`);
    // stmt.run(item.id);
}

