CREATE TABLE actors (
    id TEXT PRIMARY KEY,
    host TEXT NOT NULL,
    preferredUsername TEXT NOT NULL,
    name TEXT,
    hashedPassword TEXT,
    summary TEXT,
    icon TEXT,
    image TEXT,
    url TEXT,
    published TEXT,
    publicKey TEXT
);
CREATE INDEX hostIndex ON actors(host);
CREATE INDEX preferredUsernameIndex ON actors(preferredUsername);

CREATE TABLE objects (
    id TEXT PRIMARY KEY,
    actor TEXT,
    type TEXT NOT NULL,
    published TEXT NOT NULL,
    content TEXT,
    context TEXT,
    name TEXT,
    endTime TEXT,
    startTime TEXT,
    summary TEXT,
    updated TEXT,
    url TEXT,
    mediaType TEXT,
    duration TEXT,
    object TEXT,
    target TEXT,
    result TEXT,
    origin TEXT,

    FOREIGN KEY (actor) REFERENCES actors(id)
);
CREATE INDEX actorIndex ON objects(actor);
CREATE INDEX typeIndex ON objects(type);
CREATE INDEX publishedIndex ON objects(published);

CREATE TABLE followers (
    id TEXT PRIMARY KEY,
    actor TEXT NOT NULL,
    follower TEXT NOT NULL,
    received TEXT NOT NULL,

    FOREIGN KEY (actor) REFERENCES actors(id)
);

-- "liked": `${hostname}/actor/${user.id}/liked`,???

-- web related tables
CREATE TABLE sessions (
    token TEXT PRIMARY KEY,
    actor TEXT,

    FOREIGN KEY (actor) REFERENCES actors(id)
);