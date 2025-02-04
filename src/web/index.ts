import type { Next, ParameterizedContext } from "koa";
import type { ContextState } from "../index.ts";
import { renderWithBase } from "./template.ts";

export const getIndex = (ctx: ParameterizedContext<ContextState>, next: Next) => {
    const db = ctx.state.db;
    const hostname = ctx.state.host;
    const username = ctx.params.username;

    const token = ctx.cookies.get('token')
    //TODO validate token

    if (!token) {
        //For now just redirect to login
        ctx.redirect('/login');
        return;
    }

    const res = renderWithBase('feed.hbs', {});

    ctx.response.type = 'text/html; charset=utf-8';
    ctx.response.body = res;
}