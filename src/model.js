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
  static one(id) {
    return new Promise((resolve, reject) => {
      // Build the SQL statement (and attach a `WHERE` for the id)
      let stmt = this.read().where({id})

      // Execute the statement
      db.execute(stmt).then((rows) => {
        // Return the result
        resolve(this.serialize(rows[0]))
      }).catch(reject)
    })
  }

  /**
   * Get all rows (as model instances).
   */
  static all() {
    return new Promise((resolve, reject) => {
      // Build the SQL statement
      let stmt = this.read()

      // Execute the statement
      db.execute(stmt).then((rows) => {
        // Return the result
        resolve(rows.map(this.serialize))
      }).catch(reject)
    })
  }

  /**
   * Create a new model instance from the given values.
   */
  static create(item) {
    if (this.table == null) {
      throw new Error(`${this.name}.table must be defined`)
    }

    return new Promise((resolve, reject) => {
      // Build the SQL statement
      let values = this.deserialize(item)
      let stmt = sql.insert(this.table).values(values).returning("*")

      // Execute the statement
      db.execute(stmt).then((rows) => {
        // Return the result
        resolve(this.serialize(rows[0]))
      }).catch(reject)
    })
  }

  /**
   * Update a model instance from the given values.
   */
  static update(id, item) {
    if (this.table == null) {
      throw new Error(`${this.name}.table must be defined`)
    }

    return new Promise((resolve, reject) => {
      // Build the SQL statement (and attach a `WHERE` for the id)
      let values = this.deserialize(item)
      let stmt = sql.update(this.table, values).where({id}).returning("*")

      // Execute the statement
      db.execute(stmt).then((rows) => {
        // Return the result
        resolve(this.serialize(rows[0]))
      }).catch(reject)
    })
  }

  /**
   * Delete a single row; identified by the primaryKey (id).
   */
  static destroy(id) {
    if (this.table == null) {
      throw new Error(`${this.name}.table must be defined`)
    }

    // Build the SQL statement (and attach a `WHERE` for the id)
    let stmt = sql.deleteFrom(this.table).where({id})

    return new Promise(function(resolve, reject) {
      // Execute the statement
      db.execute(stmt).then(function(result) {
        resolve(result > 0)
      }).catch(reject)
    })
  }
}
