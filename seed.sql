CREATE TABLE actors (
    id TEXT PRIMARY KEY,
    hashed_password TEXT,
    preferred_username TEXT,
    summary TEXT,
    icon TEXT,
    url TEXT
);

CREATE TABLE inbox (
    id TEXT PRIMARY KEY,
    actor_id TEXT NOT NULL,
    type TEXT NOT NULL,
    content TEXT,
    received TEXT NOT NULL,
    published Text,
    attributedTo TEXT,

    FOREIGN KEY (actor_id) REFERENCES actors(id)
);

CREATE TABLE followers (
    id TEXT PRIMARY KEY,
    actor_id TEXT NOT NULL,
    follower_id TEXT NOT NULL,
    received TEXT NOT NULL,

    FOREIGN KEY (actor_id) REFERENCES actors(id)
);

-- "outbox": `${hostname}/actor/${user.id}/outbox`,
-- "following": `${hostname}/actor/${user.id}/following`,
-- "liked": `${hostname}/actor/${user.id}/liked`,

-- web related tables
CREATE TABLE sessions (
    token TEXT PRIMARY KEY,
    actor_id TEXT,

    FOREIGN KEY (actor_id) REFERENCES actors(id)
);