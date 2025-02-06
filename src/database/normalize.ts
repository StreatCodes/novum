import type { APubActor, APubPublicKey } from "../activity-pub/activity-pub.ts";
import type { DBActor } from "./index.ts";

interface APubImageDocument {
    type: "Image",
    name: string,
    url: string | APubLink | Array<APubLink>
}

interface APubLink {
    type: "Link",
    href: string,
    mediaType: string
}

//It's possible this could also be an array of something else...
export function normalizeImage(image: string | Array<string> | APubImageDocument): string {
    if (typeof image === 'string') return image;
    if (Array.isArray(image)) return image[0];
    if (typeof image.url === 'string') return image.url;
    if (Array.isArray(image.url)) return image.url[0].href;
    return image.url.href;
}

export function normalizePublicKey(key: string | APubPublicKey): string {
    if (typeof key === 'string') return key
    return key.publicKeyPem;
}

export function normalizeActor(actor: APubActor): DBActor {
    const url = new URL(actor.id)

    const dbActor: DBActor = {
        ...actor, //not sure if this is a good idea...
        host: url.host,
    }

    if (actor.icon) dbActor.icon = normalizeImage(actor.icon);
    if (actor.image) dbActor.image = normalizeImage(actor.image);
    if (actor.publicKey) dbActor.publicKey = normalizePublicKey(actor.publicKey);

    return dbActor;
}
