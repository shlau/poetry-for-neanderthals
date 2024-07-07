CREATE TABLE "games" (
    "id" SERIAL PRIMARY KEY,
    "in_progress" boolean DEFAULT false,
    "created_at" timestamp DEFAULT current_timestamp,
    "poet_idx" integer DEFAULT 0,
    "red_score" integer DEFAULT 0,
    "blue_score" integer DEFAULT 0,
    "words" JSONB
);

CREATE TABLE "users" (
    "id" SERIAL PRIMARY KEY,
    "name" varchar,
    "team" varchar,
    "ready" boolean DEFAULT false,
    "created_at" timestamp DEFAULT current_timestamp,
    "game_id" integer
);

ALTER TABLE
    "users"
ADD
    FOREIGN KEY ("game_id") REFERENCES "games" ("id");