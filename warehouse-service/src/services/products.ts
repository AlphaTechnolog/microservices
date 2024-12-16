import { Database } from 'bun:sqlite'
import type { Product } from './types.d'

export class ProductService {
    private static openConnection() {
        return new Database("./database.sqlite");
    }

    public getProducts(): Product[] {
        {
            using database = ProductService.openConnection();
            using query = database.query("SELECT * FROM products");
            return query.all() as Product[];
        }
    }
}