import { Column, Model, Table } from 'sequelize-typescript';

/**
 * #109 Sequelize. A `sequelize-typescript` model: `@Table` maps the class to the
 * `cats` table, `@Column` declares each attribute (the SQL type is inferred from
 * the TS type via reflect-metadata). The model *is* the repository — Sequelize
 * exposes static finders (`findAll`, `findByPk`, `create`) on the class.
 *
 * NB: requires `useDefineForClassFields: false` (set in test/jest-orms.json) —
 * otherwise ES2023 class fields define own properties that shadow Sequelize's
 * attribute accessors and every column reads back `undefined`.
 */
@Table
export class Cat extends Model {
  @Column
  name: string;

  @Column
  age: number;

  @Column
  breed: string;
}
