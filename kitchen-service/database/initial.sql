CREATE TABLE IF NOT EXISTS ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    amount REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS prepared_foods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS prepared_food_ingredients (
    id_prepared_food INTEGER NOT NULL,
    id_ingredient INTEGER NOT NULL,
    required_amount REAL NOT NULL,
    FOREIGN KEY (id_prepared_food) REFERENCES prepared_foods(id),
    FOREIGN KEY (id_ingredient) REFERENCES ingredients(id),
    PRIMARY KEY (id_prepared_food, id_ingredient)
);

CREATE INDEX idx_prepared_food_ingredients_prepared_food ON prepared_food_ingredients(id_prepared_food);
CREATE INDEX idx_prepared_food_ingredients_ingredient ON prepared_food_ingredients(id_ingredient);