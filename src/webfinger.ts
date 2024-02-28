import { Database } from "better-sqlite3";
import { RequestHandler } from "express";
import { DBActor } from "./actor";

interface WebfingerLinks {
    rel: string,
    type: string,
    href: string
}

interface WebfingerResponse {
    subject: string,
    links: WebfingerLinks[]
}

function userFromResource(resource: string): string | undefined {
    const match = resource.match(/^acct:(.*)@novum.streats.dev$/);
    if (match) {
        return match[1];
    }
}

export const handleWebfinger: RequestHandler = (req, res) => {
    const db: Database = req.app.locals.db;
    const hostname: string = req.app.locals.host;
    const username = userFromResource(req.query.resource as string); //wtf better checking todo
    if (!username) {
        res.sendStatus(404);
        return;
    }

    const stmt = db.prepare('SELECT id FROM actors WHERE id = ?');
    const user = stmt.get(username) as DBActor;

    if (!user) {
        res.sendStatus(404);
        return;
    }

    const webfinger: WebfingerResponse = {
        subject: req.query.resource as string, //TODO aswell
        links: [
            {
                rel: "self",
                type: "application/activity+json",
                href: `${hostname}/actor/${user.id}`
            }
        ]
    }

    res.json(webfinger);
}