INSERT INTO ingredients (name, amount) VALUES
('lechuga', 4),
('pollo', 2),
('carne_molida', 25),
('pasta', 32),
('queso', 100),
('jamon', 86),
('salsa_tomate', 40),
('mayonesa', 60),
('pan_canilla', 10);

INSERT INTO prepared_foods (key, name, description, image_url) VALUES
('ensalada_cesar', 'Ensalada Cesar', 'Ensalada de lechuga romana y croûtons (trozos de pan tostado) con jugo de limón, aceite de oliva, huevo, etc', 'https://imag.bonviveur.com/ensalada-cesar-casera.jpg'),
('pasta_con_carne_molida', 'Pasta con carne molida', 'Lorem ipsum sit amet consectetur asdjkasjdkasd', 'https://cdn0.recetasgratis.net/es/posts/3/2/6/espagueti_con_carne_molida_51623_orig.jpg'),
('pan_simple', 'Pan simple', 'Lorem ipsum sit amet consectetur asdjkasjdkasd', 'https://www.panaderiabistro702.mx/cdn/shop/collections/IMG_0249_1024x1024.jpg?v=1729727900');

INSERT INTO prepared_food_ingredients (id_prepared_food, id_ingredient, required_amount) VALUES
(1, 1, 5),  -- 5 de lechuga para la ensalada cesar
(1, 2, 2),  -- 2 de pollo para la ensalada cesar
(2, 3, 5),  -- 5 de carne molida para la pasta con carne molida
(2, 4, 7),  -- 7 de pasta para la pasta con carne molida
(2, 5, 10), -- 10 de queso para la pasta con carne molida
(3, 6, 5),  -- 5 de jamón para el pan simple
(3, 5, 5),  -- 5 de queso para el pan simple
(3, 7, 2),  -- 2 de salsa de tomate para el pan simple
(3, 8, 2),  -- 2 de mayonesa para el pan simple
(3, 9, 1);  -- 1 pan para el pan simple

-- SELECT * FROM ingredients;
-- SELECT * FROM prepared_foods;

-- SELECT
--     ing.name AS ingredient,
--     pfi.required_amount
-- FROM
--     prepared_food_ingredients pfi
--     INNER JOIN prepared_foods pf ON pf.id = pfi.id_prepared_food
--     INNER JOIN ingredients ing ON ing.id = pfi.id_ingredient
-- WHERE
--     pf.id = 1;

-- UPDATE ingredients SET amount = 1 WHERE id = 2;
-- UPDATE prepared_food_ingredients SET required_amount = 4 WHERE id = 2;