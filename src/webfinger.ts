import type { ParameterizedContext, Next } from 'koa';
import type { ContextState } from "./index.ts";
import { getActorById } from "./database/index.ts";

interface WebfingerLinks {
    rel: string,
    type: string,
    href: string
}

export interface WebfingerResponse {
    subject: string,
    aliases?: string[],
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

export function userFromHandle(handle: string): UserResult {
    const match = handle.match(/^@?([A-Za-z0-9-]+)@(.*)$/);
    return {
        name: match?.[1],
        host: match?.[2]
    }
}

export const handleWebfinger = (ctx: ParameterizedContext<ContextState>, next: Next) => {
    const db = ctx.state.db;
    const hostname = ctx.state.host;
    const queryResource = ctx.query['resource'];
    if (typeof queryResource !== 'string') {
        ctx.response.status = 400;
        return undefined;
    }

    const resource = userFromResource(queryResource);
    if (!resource.name || !resource.host || !hostname.endsWith(resource.host)) {
        ctx.response.status = 404;
        return;
    }

    const user = getActorById(db, resource.name);

    if (!user) {
        ctx.response.status = 404;
        return;
    }

    const webfinger: WebfingerResponse = {
        subject: queryResource,
        links: [
            {
                rel: "self",
                type: "application/activity+json",
                href: `${hostname}/actor/${user.id}`
            }
        ]
    }

    ctx.response.type = 'application/jrd+json';
    ctx.response.body = JSON.stringify(webfinger);
}

export async function searchUser(user: UserResult): Promise<WebfingerResponse> {
    if (!user.name || !user.host) throw new Error("Can't lookup user without username and host")

    const params = new URLSearchParams()
    params.set('resource', `${user.name}@${user.host}`)

    const res = await fetch(`https://${user.host}/.well-known/webfinger?${params.toString()}`, {
        headers: {
            'Accept': 'application/jrd+json'
        }
    });

    return await res.json();
}