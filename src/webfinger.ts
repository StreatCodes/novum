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

interface UserResult {
    name?: string,
    host?: string
}

function userFromResource(resource: string): UserResult {
    const match = resource.match(/^acct:@?([a-z0-9-]+)@(.*)$/);
    return {
        name: match?.[1],
        host: match?.[2]
    }
}

export const handleWebfinger: RequestHandler = (req, res) => {
    const db: Database = req.app.locals.db;
    const hostname: string = req.app.locals.host;
    const resource = userFromResource(req.query.resource as string); //wtf better checking todo
    if (!resource.name || !resource.host || !hostname.endsWith(resource.host)) {
        res.sendStatus(404);
        return;
    }

    const stmt = db.prepare('SELECT id FROM actors WHERE id = ?');
    const user = stmt.get(resource.name) as DBActor;

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