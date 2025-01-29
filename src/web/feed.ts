import type { Next, ParameterizedContext } from "koa";
import type { ContextState } from "../index.ts";
import { renderWithBase } from "./template.ts";

export const getFeed = (ctx: ParameterizedContext<ContextState>, next: Next) => {
    const res = renderWithBase('feed.hbs', {});

    ctx.response.type = 'text/html; charset=utf-8';
    ctx.response.body = res;
}