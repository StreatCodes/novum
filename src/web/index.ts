import type { Next, ParameterizedContext } from "koa";
import type { ContextState } from "../index.ts";

export const getIndex = (ctx: ParameterizedContext<ContextState>, next: Next) => {
    const db = ctx.state.db;
    const hostname = ctx.state.host;
    const username = ctx.params.username;

    const token = ctx.cookies.get('token')

    ctx.response.type = 'text/html; charset=utf-8';
    ctx.response.body = `<html><body>verified user</body></html>`
}