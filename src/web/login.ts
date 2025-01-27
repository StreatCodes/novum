import type { Next, ParameterizedContext } from "koa";
import type { ContextState } from "../index.ts";
import { renderWithBase } from "./template.ts";
import { createSession, getActorById } from "../database.ts";
import { generateToken, hashPassword, verifyPassword } from "../auth.ts";

export const getLogin = (ctx: ParameterizedContext<ContextState>, next: Next) => {
    //User already logged in, redirect them to their feed?
    const token = ctx.cookies.get('token')
    if (token) {
        ctx.response.header.location = '/usersfeed'
    }

    const res = renderWithBase('login.hbs', {});

    ctx.response.type = 'text/html; charset=utf-8';
    ctx.response.body = res;
}

interface LoginRequest {
    username: string,
    password: string
}

export const postLogin = (ctx: ParameterizedContext<ContextState>, next: Next) => {
    const db = ctx.state.db;
    const formData: LoginRequest = ctx.request.body;

    const actor = getActorById(db, formData.username)
    if (!actor) {
        ctx.response.body = `<p class="error">Invalid credentials</p>`
        return;
    }

    const passwordMatch = verifyPassword(formData.password, actor.hashed_password)
    if (!passwordMatch) {
        ctx.response.body = `<p class="error">Invalid credentials</p>`
        return;
    }

    const sessionToken = generateToken();
    createSession(db, { actor_id: actor.id, token: sessionToken })

    ctx.cookies.set("token", sessionToken, { secure: ctx.secure, httpOnly: true, sameSite: "lax" });
    ctx.set('HX-Redirect', '/feed')
    ctx.status = 200;
}
