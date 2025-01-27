import type { Next, ParameterizedContext } from "koa";
import type { ContextState } from "../index.ts";
import { renderWithBase } from "./template.ts";
import { createActor, createSession, getActorById } from "../database.ts";
import { generateToken, hashPassword, passwordInvalid, usernameInvalid } from "../auth.ts";

export const getRegister = (ctx: ParameterizedContext<ContextState>, next: Next) => {
    const res = renderWithBase('register.hbs', {});

    ctx.response.type = 'text/html; charset=utf-8';
    ctx.response.body = res;
}

interface RegisterRequest {
    username: string,
    password: string
}

export const postRegister = (ctx: ParameterizedContext<ContextState>, next: Next) => {
    const db = ctx.state.db;

    const formData: RegisterRequest = ctx.request.body;
    const invalidUsername = usernameInvalid(formData.username);
    if (invalidUsername) {
        ctx.response.body = `<p class="error">${invalidUsername}</p>`
        return;
    }

    const invalidPassword = passwordInvalid(formData.password);
    if (invalidPassword) {
        ctx.response.body = `<p class="error">${invalidPassword}</p>`
        return;
    }

    const hashedPassword = hashPassword(formData.password);

    const existingActor = getActorById(db, formData.username);
    if (existingActor) {
        ctx.response.body = `<p class="error">An account with that username already exists.</p>`
        return;
    }

    createActor(db, {
        id: formData.username,
        preferred_username: formData.username,
        hashed_password: hashedPassword
    });

    const sessionToken = generateToken();
    createSession(db, { actor_id: formData.username, token: sessionToken })

    ctx.cookies.set("token", sessionToken, { secure: ctx.secure, httpOnly: true, sameSite: "lax" });
    ctx.set('HX-Redirect', '/feed')
    ctx.status = 200;
}
