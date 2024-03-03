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

export interface DBActivity {
    id: string,
    actor_id: string,
    type: string,
    data: string
}

//TODO fix any
export function insertActivity(db: Database, actorId: string, data: any) {
    const stmt = db.prepare('INSERT INTO activities (id, actor_id, type, data) VALUES (?, ?, ?, ?)');
    stmt.run(data.id, actorId, data.type, JSON.stringify(data));
}
