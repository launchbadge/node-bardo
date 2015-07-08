import sql from "sql-bricks-postgres"
import db from "./db"
import util from "./util"

export default class Model {
  // NOTE: Must be defined by the derived class
  static table = null

  static serialize(row) {
    return util.serialize(row)
  }

  static deserialize(item) {
    return util.deserialize(item)
  }

  static read() {
    if (this.table == null) {
      throw new Error(`${this.name}.table must be defined`)
    }

    return sql.select("*").from(this.table)
  }

  /**
   * Get a single model instance; identified by the primaryKey (id).
   */
  static async one(id) {
    // Build the SQL statement (and attach a `WHERE` for the id)
    let stmt = this.read().where({id})

    // Execute the statement
    let row = (await db.execute(stmt))[0]

    // Return the result
    return this.serialize(row)
  }

  /**
   * Get all rows (as model instances).
   */
  static async all() {
    // Build the SQL statement
    let stmt = this.read()

    // Execute the statement
    let rows = (await db.execute(stmt))

    // Return the result
    return rows.map(this.serialize)
  }

  /**
   * Create a new model instance from the given values.
   */
  static async create(item) {
    if (this.table == null) {
      throw new Error(`${this.name}.table must be defined`)
    }

    // Build the SQL statement
    let values = this.deserialize(item)
    let stmt = sql.insert(this.table).values(values).returning("*")

    // Execute the statement
    let row = (await db.execute(stmt))[0]

    // Return the result
    return this.serialize(row)
  }

  /**
   * Update a model instance from the given values.
   */
  static async update(id, item) {
    if (this.table == null) {
      throw new Error(`${this.name}.table must be defined`)
    }

    // Build the SQL statement (and attach a `WHERE` for the id)
    let values = this.deserialize(item)
    let stmt = sql.update(this.table, values).where({id}).returning("*")

    // Execute the statement
    let row = (await db.execute(stmt))[0]

    // Return the result
    return this.serialize(row)
  }

  /**
   * Delete a single row; identified by the primaryKey (id).
   */
  static async destroy(id) {
    if (this.table == null) {
      throw new Error(`${this.name}.table must be defined`)
    }

    // Build the SQL statement (and attach a `WHERE` for the id)
    let stmt = sql.deleteFrom(this.table).where({id})

    // Execute the statement
    let result = await db.execute(stmt)
    return result > 0
  }
}
