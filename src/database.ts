import { Database } from "better-sqlite3";

export interface DBActor {
    id: string,
    preferred_username?: string,
    summary?: string,
    icon?: string,
    url?: string
}

export function getActorById(db: Database, actorId: string): DBActor | undefined {
    const stmt = db.prepare('SELECT id FROM actors WHERE id = ?');
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
