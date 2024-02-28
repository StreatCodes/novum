CREATE TABLE actors (
    id TEXT PRIMARY KEY,
    preferred_username TEXT,
    summary TEXT,
    icon TEXT,
    url TEXT
);

CREATE TABLE activities (
    id TEXT PRIMARY KEY,
    actor_id TEXT NOT NULL,
    type TEXT NOT NULL,
    data TEXT,

    FOREIGN KEY (actor_id) REFERENCES actors(id)
);
