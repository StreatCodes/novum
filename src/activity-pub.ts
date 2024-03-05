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
    orderedItems: APubNote[]
}

export interface APubActivity {
    "@context": "https://www.w3.org/ns/activitystreams",
    actor: string,
    id: string,
    type: 'Create' | 'Follow',
    published?: string,
    to?: string,
    object?: APubNote
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