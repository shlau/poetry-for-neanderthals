CREATE TABLE "games" (
    "id" integer PRIMARY KEY,
    "in_progress" boolean,
    "created_at" timestamp,
    "poet_idx" integer,
    "red_score" integer,
    "blue_score" integer,
    "words" JSONB
);

CREATE TABLE "users" (
    "id" integer PRIMARY KEY,
    "name" varchar,
    "team" varchar,
    "ready" boolean,
    "created_at" timestamp,
    "game_id" integer
);

ALTER TABLE
    "users"
ADD
    FOREIGN KEY ("game_id") REFERENCES "games" ("id");