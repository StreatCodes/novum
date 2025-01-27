import path from 'node:path'
import fs from 'node:fs/promises'
import type { Next, ParameterizedContext } from "koa";
import type { ContextState } from "../index.ts";

const knownFileTypes: Record<string, string> = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.txt': 'text/plain'
}

export const getFileHandler = async (ctx: ParameterizedContext<ContextState>, next: Next) => {
    const resourceDirectory = '/res/'
    const resolvedPath = path.resolve('.', ctx.path);

    // Ensure the resolved path is within the resources directory
    if (!resolvedPath.startsWith(resourceDirectory)) {
        console.log(`attempted path traversal ${ctx.path}`)
        ctx.response.status = 404;
        return;
    }

    const safePath = path.join('.', resolvedPath);
    const data = await fs.readFile(safePath, 'utf-8')

    const extension = path.extname(safePath)
    const responseType = knownFileTypes[extension]

    ctx.response.type = responseType ?? 'text/plain';
    ctx.response.body = data;
}