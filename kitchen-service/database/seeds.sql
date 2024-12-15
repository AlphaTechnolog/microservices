INSERT INTO ingredients (name, amount) VALUES
('Lechuga', 4),
('Pollo', 2);

INSERT INTO prepared_foods (name) VALUES ('Ensalada Cesar');

INSERT INTO prepared_food_ingredients (id_prepared_food, id_ingredient, required_amount) VALUES
(1, 1, 5),
(1, 2, 2);

SELECT * FROM ingredients;
SELECT * FROM prepared_foods;

SELECT
    ing.name AS ingredient,
    pfi.required_amount
FROM
    prepared_food_ingredients pfi
    INNER JOIN prepared_foods pf ON pf.id = pfi.id_prepared_food
    INNER JOIN ingredients ing ON ing.id = pfi.id_ingredient
WHERE
    pf.id = 1;

-- UPDATE ingredients SET amount = 1 WHERE id = 2;
-- UPDATE prepared_food_ingredients SET required_amount = 4 WHERE id = 2;