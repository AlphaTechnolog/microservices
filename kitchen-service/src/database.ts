import { Database } from "bun:sqlite";

export const getConnection = () => new Database("./database.sqlite");

export const getWarehouseConnection = () =>
  new Database("../warehouse-service/database.sqlite");
