import type { Next, ParameterizedContext } from "koa";
import type { ContextState } from "../index.ts";

export const handleIndex = (ctx: ParameterizedContext<ContextState>, next: Next) => {
    const db = ctx.state.db;
    const hostname = ctx.state.host;
    const username = ctx.params.username;

    ctx.req.headers.cookie

    // const user = getActorById(db, username);

    ctx.response.type = 'text/html; charset=utf-8';
    ctx.response.body = `<html><body>Hello, world</body></html>`
}