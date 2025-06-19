-- Per-item notes
alter table grocery_items add column if not exists note text;

-- Per-list notes
alter table grocery_lists add column if not exists note text;

-- Item categories
alter table grocery_items add column if not exists category text;

-- Item quantity and units
alter table grocery_items add column if not exists quantity numeric;
alter table grocery_items add column if not exists unit text;

-- Item icon
alter table grocery_items add column if not exists icon text;

-- List archived/locked
alter table grocery_lists add column if not exists archived boolean default false;

-- Recipes table for user-created recipes
CREATE TABLE IF NOT EXISTS recipes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    ingredients text NOT NULL, -- Could be JSON for structure, but text for MVP
    instructions text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc', now())
);

-- Index for quick lookup by user
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id); 