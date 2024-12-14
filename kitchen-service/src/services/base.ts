import { Database } from 'bun:sqlite'

export default class BaseService {
  constructor(
    protected _db: Database,
  ) {}
}