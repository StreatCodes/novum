import Sqlite, { type Database } from "better-sqlite3";
import fs from 'node:fs/promises';
import type { APubActivity, APubActor, APubNote, APubObject } from "../activity-pub/activity-pub.ts";

export async function initTestDB(): Promise<Database> {
    const seedSql = await fs.readFile('seed.sql', 'utf-8');
    const db = new Sqlite(':memory:');

    db.exec(seedSql);
    return db;
}

export interface DBActor extends APubActor {
    host: string;
    hashedPassword?: string,
}

export function createActor(db: Database, actor: DBActor) {
    const stmt = db.prepare('INSERT INTO actors (id, host, hashedPassword, preferredUsername, name, summary, icon, image, url, published, publicKey) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    stmt.run(actor.id, actor.host, actor.hashedPassword, actor.preferredUsername, actor.name, actor.summary, actor.icon, actor.image, actor.url, actor.published, actor.publicKey);
}

export function getActorById(db: Database, actorId: string): DBActor | undefined {
    const stmt = db.prepare('SELECT * FROM actors WHERE id = ?');
    return stmt.get(actorId) as DBActor | undefined;
}

export function getActorByHandle(db: Database, preferredUsername: string, host: string): DBActor | undefined {
    const stmt = db.prepare('SELECT * FROM actors WHERE preferredUsername = ? AND host = ?');
    return stmt.get(preferredUsername, host) as DBActor | undefined;
}

export function addObject(db: Database, item: APubObject | APubActivity | APubNote) {
    const stmt = db.prepare(`INSERT INTO objects
    (id, actor, type, published, content, context, name, endTime,
    startTime, summary, updated, url, mediaType, duration, object,
    target, result, origin)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    stmt.run(item.id, item['actor'], item.type, item.published, item.content,
        item.context, item.name, item.endTime, item.startTime, item.summary,
        item.updated, item.url, item.mediaType, item.duration, item['object'],
        item['target'], item['result'], item['origin']
    );
}

export function getObjectById(db: Database, objectId: string): APubObject | APubActivity | APubNote {
    const stmt = db.prepare(`SELECT * FROM objects WHERE id = ?`);
    return stmt.get(objectId) as APubObject | APubActivity | APubNote | undefined;
}

export function getObjectsByActor(db: Database, actorId: string): Array<APubObject | APubActivity | APubNote> {
    const stmt = db.prepare(`SELECT * FROM objects WHERE actor = ?`);
    return stmt.all(actorId) as Array<APubObject | APubActivity | APubNote>;
}

export interface DBFollow {
    id: string,
    actorId: string,
    followerId: string,
    received: string
}

export function getFollowers(db: Database, username: string): DBFollow[] {
    const stmt = db.prepare(`SELECT * FROM followers WHERE actor = ?`);
    return stmt.all(username) as DBFollow[];
}

export function addFollower(db: Database, follow: DBFollow) {
    const stmt = db.prepare(`INSERT INTO followers
    (id, actor, followerId, received)
    VALUES (?, ?, ?, ?)`);
    stmt.run(follow.id, follow.actorId, follow.followerId, follow.received);
}

export function deleteFollower(db: Database, following: string, follower: string) {
    const stmt = db.prepare(`DELETE FROM followers
    WHERE actor = ? AND followerId = ?`);
    stmt.run(following, follower);
}

export interface DBSession {
    token: string,
    actorId: string,
}

export function createSession(db: Database, session: DBSession) {
    const stmt = db.prepare('INSERT INTO sessions (token, actor) VALUES (?, ?)');
    stmt.run(session.token, session.actorId);
}

export function getSession(db: Database, session: DBSession): DBSession | undefined {
    const stmt = db.prepare('SELECT * FROM sessions WHERE token = ? AND actor = ?');
    return stmt.get(session.token, session.actorId) as DBSession | undefined;
}

export function deleteSession(db: Database, session: DBSession) {
    const stmt = db.prepare(`DELETE FROM sessions WHERE token = ? AND actor = ?`);
    stmt.run(session.token, session.actorId);
}