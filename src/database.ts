import Sqlite, { type Database } from "better-sqlite3";
import fs from 'node:fs/promises';

export async function initTestDB(): Promise<Database> {
    const seedSql = await fs.readFile('seed.sql', 'utf-8');
    const db = new Sqlite(':memory:');

    db.exec(seedSql);
    return db;
}

export interface DBActor {
    id: string,
    hashed_password?: string,
    preferred_username?: string,
    summary?: string,
    icon?: string,
    url?: string
}

export function createActor(db: Database, actor: DBActor) {
    const stmt = db.prepare('INSERT INTO actors (id, hashed_password, preferred_username, summary, icon, url) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run(actor.id, actor.hashed_password, actor.preferred_username, actor.summary, actor.icon, actor.url);
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
    follower_id: string,
    received: string
}

export function getFollowers(db: Database, username: string): DBFollow[] {
    const stmt = db.prepare(`SELECT * FROM followers WHERE actor_id = ?`);
    return stmt.all(username) as DBFollow[];
}

export function addFollower(db: Database, follow: DBFollow) {
    const stmt = db.prepare(`INSERT INTO followers
    (id, actor_id, follower_id, received)
    VALUES (?, ?, ?, ?)`);
    stmt.run(follow.id, follow.actor_id, follow.follower_id, follow.received);
}

export function deleteFollower(db: Database, following: string, follower: string) {
    const stmt = db.prepare(`DELETE FROM followers
    WHERE actor_id = ? AND follower_id = ?`);
    stmt.run(following, follower);
}

export interface DBSession {
    token: string,
    actor_id: string,
}

export function createSession(db: Database, session: DBSession) {
    const stmt = db.prepare('INSERT INTO sessions (token, actor_id) VALUES (?, ?)');
    stmt.run(session.token, session.actor_id);
}

export function getSession(db: Database, session: DBSession): DBSession | undefined {
    const stmt = db.prepare('SELECT * FROM sessions WHERE token = ? AND actor_id = ?');
    return stmt.get(session.token, session.actor_id) as DBSession | undefined;
}

export function deleteSession(db: Database, session: DBSession) {
    const stmt = db.prepare(`DELETE FROM sessions WHERE token = ? AND actor_id = ?`);
    stmt.run(session.token, session.actor_id);
}