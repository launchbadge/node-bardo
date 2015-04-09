var pg = require("pg").native;
var config = require("config");
var Promise = require("bluebird");

exports.execute = execute;
function execute(statement, values) {
  return new Promise(function(resolve, reject) {
    if (!(typeof statement === "string" || statement instanceof String)) {
      // The statement is not a string; assuming that this is a prepared
      // statement from sql-bricks
      var params = statement.toParams();
      statement = params.text;
      values = params.values;
    }

    // Default values to an empty array
    values = values || [];

    // Establish a new connection to postgres
    pg.connect({
      user: config.get("db.user"),
      password: config.get("db.password"),
      database: config.get("db.name"),
      host: config.get("db.host"),
      port: config.get("db.port"),
    }, function(err, client, done) {
      // Handle and reject if an error occurred
      if (err) {
        done();
        return reject(err);
      }

      // Send the statement
      client.query(statement, values, function(err, result) {
        done();

        // Handle and reject if an error occurred
        if (err) {
          return reject(err);
        }

        return resolve(result);
      });
    });
  });
}

// Cache of table names for a database name
var _tableNames = {};

exports.truncate = truncate;
function truncate(tables) {
  function callback(tables) {
    var tableNames = tables
      .map(function(name) {
        return '"' + name + '"';
      })
      .join(", ");

    return execute("TRUNCATE " + tableNames + " RESTART IDENTITY CASCADE");
  }

  if (!tables) {
    // No explicit list of tables was given
    // Do we have something cached?
    tables = _tableNames[config.get("db.name")];
    if (tables !== undefined) {
      return callback(tables);
    }

    // No cache; query for all tables
    return execute(
        "SELECT table_schema, table_name, table_type " +
        "FROM information_schema.tables"
    ).then(function(result) {
        tables = [];
        for (var i = 0; i < result.rows.length; i += 1) {
          var row = result.rows[i];

          if (row.table_type === "view") {
            continue;
          }

          if ([
                "information_schema",
                "pg_catalog",
                "sql_features",
              ].indexOf(row.table_schema) >= 0) {
            continue;
          }

          tables.push(row.table_name);
        }

        // Push this into the cache
        _tableNames[config.get("db.name")] = tables;

        // Continue
        return callback(tables);
      }
    );
  }

  return callback(tables);
}
