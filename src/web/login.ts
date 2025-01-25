import type { Next, ParameterizedContext } from "koa";
import type { ContextState } from "../index.ts";
import { renderWithBase } from "./template.ts";

export const getLogin = (ctx: ParameterizedContext<ContextState>, next: Next) => {
    const db = ctx.state.db;
    const hostname = ctx.state.host;
    const username = ctx.params.username;


    //User already logged in, redirect them to their feed?
    const token = ctx.cookies.get('token')
    if (token) {
        ctx.response.header.location = '/usersfeed'
    }

    const res = renderWithBase('login.hbs', {});

    ctx.response.type = 'text/html; charset=utf-8';
    ctx.response.body = res;
}