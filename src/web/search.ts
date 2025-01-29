import type { Next, ParameterizedContext } from "koa";
import type { ContextState } from "../index.ts";
import { renderWithBase } from "./template.ts";
import { searchUser } from "../webfinger.ts";

interface SearchParams {
    query: string,
}

export const getSearch = async (ctx: ParameterizedContext<ContextState>, next: Next) => {
    const params = ctx.query;
    let searchQuery = params.query;
    if (Array.isArray(searchQuery)) {
        searchQuery = params.query[0]
    }

    //TODO first lookup local copy
    console.log('params', searchQuery)
    const queryResult = await searchUser('mastodon.social', searchQuery)
    if (queryResult) {
        const userLink = queryResult.links.find(link => link.rel === 'self');
        ingestUser(userLink.href)
    }
    console.log('queryResult:')
    console.log(queryResult)

    const res = renderWithBase('search.hbs', {});

    ctx.response.type = 'text/html; charset=utf-8';
    ctx.response.body = res;
}




async function ingestUser(address: string): Promise<void> {
    const res = await fetch(address, {
        headers: {
            'Accept': 'application/activity+json'
        }
    });

    console.log(await res.text());
    getOutbox();
}

export async function getOutbox(): Promise<void> {

    const res = await fetch(`https://mastodon.social/users/streats/outbox`, {
        headers: {
            'Accept': 'application/activity+json'
        }
    });

    console.log(await res.text());
}