export interface Repository<T, ID> {
  findById(id: ID): T | null;
  findAll(): T[];
  save(entity: T): T;
  delete(id: ID): void;
}
