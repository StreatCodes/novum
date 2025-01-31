import type { Next, ParameterizedContext } from "koa";
import type { ContextState } from "../index.ts";
import { renderWithBase } from "./template.ts";
import { searchUser, userFromHandle } from "../webfinger.ts";
import { ingestActor } from "../database/ingest.ts";

export const getSearch = async (ctx: ParameterizedContext<ContextState>, next: Next) => {
    const db = ctx.state.db;

    const params = ctx.query;
    let searchQuery = params.query;
    if (Array.isArray(searchQuery)) {
        searchQuery = params.query[0]
    }

    //TODO first lookup local copy
    const user = userFromHandle(searchQuery);
    console.log(user)

    const queryResult = await searchUser(user)
    if (queryResult) {
        const actorLink = queryResult.links.find(link => link.rel === 'self');
        await ingestActor(db, actorLink.href, true)
    }

    const res = renderWithBase('search.hbs', {});

    ctx.response.type = 'text/html; charset=utf-8';
    ctx.response.body = res;
}
