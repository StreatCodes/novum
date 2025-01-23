export interface APubActor {
    "@context": "https://www.w3.org/ns/activitystreams",
    type: "Person",
    id: string,
    following: string,
    followers: string,
    liked: string,
    inbox: string,
    outbox: string,
    preferredUsername?: string,
    name: string,
    summary?: string,
    icon?: string,
    url?: string,
}

export interface APubOrderedCollection {
    "@context": "https://www.w3.org/ns/activitystreams",
    summary: string,
    type: "OrderedCollection",
    totalItems: number,
    orderedItems: APubNote[] | APubFollower[]
}

export interface APubActivity {
    "@context": "https://www.w3.org/ns/activitystreams",
    actor: string,
    id: string,
    type: 'Create' | 'Follow' | 'Undo',
    published?: string,
    to?: string,
    object?: APubNote | APubFollower | APubFollow
}

export interface APubNote {
    type: 'Note',
    id?: string,
    content?: string,
    name?: string,
    attributedTo?: string,
    conversation?: string,
    published?: string,
    summary?: string,
    to?: string,
    url?: string
}

export type APubFollower = string;
export interface APubFollow {
    id: string,
    type: 'Follow',
    actor: string,
    object: string
}