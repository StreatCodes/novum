import fs from "node:fs/promises"
import path from "node:path";
import Handlebars from "handlebars";
import type { DBActor } from "../database/index.ts";

const templates = new Map<string, Handlebars.TemplateDelegate>();

export async function compileTemplates(dir: string): Promise<void> {
    const files = await fs.readdir(dir, { recursive: true });
    for (const file of files) {
        const filePath = path.join(dir, file);
        const fileText = await fs.readFile(filePath, { encoding: 'utf8' });
        const template = Handlebars.compile(fileText);
        templates.set(file, template);
        console.log(`Compiled template ${file}`);
    }
}

/** Renders the template embedded in the base template.
 * @param templatePath the template path relative to src/web/templates 
 */
export function renderWithBase(templatePath: string, context: any): string {
    const innerTemplate = templates.get(templatePath);
    if (!innerTemplate) throw new Error(`Template ${templatePath} not found`);
    const inner = innerTemplate(context);

    const baseTemplate = templates.get('base.hbs');
    if (!baseTemplate) throw new Error(`Base template not found`);
    return baseTemplate({ body: inner });
}

Handlebars.registerHelper('user_handle', (user: DBActor) => {
    let handle = `@${user.preferredUsername}`;
    if (user.host) handle += `@${user.host}`
    return handle;
});

Handlebars.registerHelper('format_date', (dateString: string) => {
    const date = new Date(dateString);
    const formatter = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
    return formatter.format(date);
})