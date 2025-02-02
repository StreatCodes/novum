import type { Next, ParameterizedContext } from "koa";
import type { ContextState } from "../index.ts";
import { renderWithBase } from "./template.ts";
import { getActorByHandle } from "../database/index.ts";
import { userFromHandle } from "../webfinger.ts";

export const getUser = (ctx: ParameterizedContext<ContextState>, next: Next) => {
    const db = ctx.state.db;

    const handleParam = ctx.params.handle;
    const handle = userFromHandle(handleParam)
    if (!handle.name || !handle.host) return 'Bad handle' //TODO

    const user = getActorByHandle(db, handle.name, handle.host);
    console.log('hit user endpoint', user)

    const res = renderWithBase('user.hbs', { user })

    ctx.response.type = 'text/html; charset=utf-8';
    ctx.response.body = res;
}