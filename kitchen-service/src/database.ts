import { Database } from 'bun:sqlite'

export const getConnection = () => new Database("./database.sqlite")