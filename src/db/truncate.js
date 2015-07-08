import config from "../config"
import execute from "./execute"

// Cache of table names for a database name
var _tableNames = {}

export default function truncate(tables) {
  let callback = function(tables) {
    if (!tables || tables.length === 0) {
      return null
    }

    var tableNames = tables
      .map(function(name) {
        return '"' + name + '"'
      })
      .join(", ")

    return execute("TRUNCATE " + tableNames + " RESTART IDENTITY CASCADE")
  }

  if (process.domain != null) {
    callback = process.domain.bind(callback)
  }

  if (!tables) {
    // No explicit list of tables was given
    // Do we have something cached?
    tables = _tableNames[config.get("name")]
    if (tables !== undefined) {
      return callback(tables)
    }

    // No cache query for all tables
    return execute(
        "SELECT table_schema, table_name, table_type " +
        "FROM information_schema.tables"
    ).then(function(result) {
        tables = []
        for (var i = 0; i < result.length; i += 1) {
          var row = result[i]

          if (row.table_type === "view") {
            continue
          }

          if ([
                "information_schema",
                "pg_catalog",
                "sql_features",
              ].indexOf(row.table_schema) >= 0) {
            continue
          }

          tables.push(row.table_name)
        }

        // Push this into the cache
        _tableNames[config.get("name")] = tables

        // Continue
        return callback(tables)
      }
    )
  }

  return callback(tables)
}
