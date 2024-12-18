CREATE TABLE IF NOT EXISTS ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    amount REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS prepared_foods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL,
    name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS prepared_food_ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_prepared_food INTEGER NOT NULL,
    id_ingredient INTEGER NOT NULL,
    required_amount REAL NOT NULL,
    FOREIGN KEY (id_prepared_food) REFERENCES prepared_foods(id),
    FOREIGN KEY (id_ingredient) REFERENCES ingredients(id)
);

CREATE INDEX idx_prepared_food_ingredients_prepared_food ON prepared_food_ingredients(id_prepared_food);
CREATE INDEX idx_prepared_food_ingredients_ingredient ON prepared_food_ingredients(id_ingredient);
