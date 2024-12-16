import { Database } from 'bun:sqlite'
import type { Product } from './types.d'

export class ProductService {
    private static openConnection() {
        return new Database("./database.sqlite");
    }

    public getProducts(): Product[] {
        {
            using database = ProductService.openConnection();
            using query = database.query("SELECT name, SUM(amount) AS amount FROM products GROUP BY name");
            return query.all() as Product[];
        }
    }

    public getProductFromName(name: string): Product | undefined {
        {
            using database = ProductService.openConnection();
            using query = database.query("SELECT name, SUM(amount) AS amount FROM products WHERE name = ? GROUP BY name LIMIT 1");
            return query.get(name) as Product | undefined;
        }
    }

    public putMovement(movement: { item: string, amount: number }): void {
        {
            using database = ProductService.openConnection();
            using query = database.prepare("INSERT INTO products (name, amount) VALUES (?, ?)");
            query.run(movement.item, movement.amount);
        }
    }
}