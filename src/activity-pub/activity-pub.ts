export interface APubObject {
    "@context": "https://www.w3.org/ns/activitystreams",
    id: string,
    type: string,
    // attachment?: string,
    // attributedTo?: string,
    // audience?: string,
    content?: string,
    context?: string,
    name?: string,
    endTime?: string,
    // generator?: string,
    // icon?: string,
    // image?: string,
    // inReplyTo?: string,
    // location?: string,
    // preview?: string,
    published?: string,
    // replies?: string, // Collection
    startTime?: string,
    summary?: string,
    // tag?: string,
    updated?: string,
    url?: string,
    // to?: string, array
    // bto?: string, array
    // cc?: string, array
    // bcc?: string, array
    mediaType?: string,
    duration?: string
}

export interface APubActor extends APubObject {
    type: "Person",
    following?: string,
    followers?: string,
    liked?: string,
    inbox?: string,
    outbox?: string,
    preferredUsername: string, //strangely this is the users identifier @{user}@example.com
    name?: string, //This is actually the users display name
    summary?: string,
    icon?: string,
    image?: string,
    url?: string,
    publicKey?: string | APubPublicKey;
}

export interface APubOrderedCollection<T> {
    "@context": "https://www.w3.org/ns/activitystreams",
    summary: string,
    type: "OrderedCollection",
    totalItems: number,
    next?: string,
    prev?: string,
    orderedItems: Array<T>
}

export interface APubActivity extends APubObject {
    actor: string,
    type: 'Announce' | 'Create' | 'Follow' | 'Undo',
    object?: APubNote | APubFollower,
    target?: string,
    result?: string,
    origin?: string,
    instrument?: string,
}

export interface APubNote extends APubObject {
    type: 'Note'
}

export type APubFollower = string;

export interface APubOutbox extends Object {
    type: 'OrderedCollection',
    totalItems: number,
    first: string,
    last: string
}

export interface APubPublicKey {
    id: string,
    owner: string,
    publicKeyPem: string
}