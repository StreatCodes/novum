import type { Database } from "better-sqlite3";
import type { APubActivity, APubActor, APubObject, APubOrderedCollection, APubOutbox } from "../activity-pub/activity-pub.ts";
import { addObject, createActor, getActorById, getObjectById } from "./index.ts";
import { normalizeActor, normalizeImage } from "./normalize.ts";

export async function ingestActor(db: Database, address: string, recursive = false): Promise<void> {
    console.log('Ingesting Actor:', address)

    const res = await fetch(address, {
        headers: {
            'Accept': 'application/activity+json'
        }
    });

    const actor: APubActor = await res.json();
    const err = (actor as any).error; //TODO do better
    if (err) {
        console.log(`cannot ingest ${address} error ${err}`)
        return
    }

    const dbActor = normalizeActor(actor);
    const exists = getActorById(db, dbActor.id)
    if (!exists) createActor(db, dbActor);

    if (recursive) await ingestOutbox(db, dbActor.outbox);
}

export async function ingestOutbox(db: Database, outboxUrl: string): Promise<void> {
    console.log('Ingesting Outbox:', outboxUrl)
    const res = await fetch(outboxUrl, {
        headers: {
            'Accept': 'application/activity+json'
        }
    });

    const outbox: APubOutbox = await res.json();
    await ingestCollection(db, outbox.first);
}

export async function ingestCollection(db: Database, collectionUrl: string): Promise<void> {
    console.log('Ingesting Collection:', collectionUrl)
    const res = await fetch(collectionUrl, {
        headers: {
            'Accept': 'application/activity+json'
        }
    });

    const collection: APubOrderedCollection<APubActivity> = await res.json();
    for (const item of collection.orderedItems) {
        await ingestActivity(db, item)
    }

    if (collection.next) await ingestCollection(db, collection.next)
}

export async function ingestActivity(db: Database, activity: APubActivity): Promise<void> {
    console.log('Ingesting Activity:', activity.id)
    if (typeof activity.object === 'object') {
        await ingestObject(db, activity.object, activity.actor);
        activity.object = activity.object.id
    }
    const exists = getObjectById(db, activity.id);
    if (!exists) addObject(db, activity);
}

export async function ingestObject(db: Database, object: APubObject, actorId: string): Promise<void> {
    console.log('Ingesting Object:', object.id)
    await ingestActor(db, actorId)
    const exists = getObjectById(db, object.id);
    if (!exists) addObject(db, object);
}