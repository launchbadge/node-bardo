var pg = require("pg").native
var config = require("./config")

// TODO: Move to util.createDatabase
export function create(name) {
  // Use the config name if no name is passed
  if (!name) {
    name = config.get("name")
  }

  return new Promise(function(resolve, reject) {
    // Create a new client (connecting to `template1`)
    var client = new pg.Client({
      user: config.get("user"),
      password: config.get("password"),
      port: config.get("port"),
      host: config.get("host"),
      database: "template1",
    })

    // Establish a connection
    client.connect(function() {
      // Create the database
      var text = "CREATE DATABASE " + name
      client.query(text, function(err) {
        client.end()

        // Handle and reject if an error occurred
        if (err) {
          return reject(err)
        }

        return resolve()
      })
    })
  })
}

// TODO: Move to util.dropDatabase
export function drop(name) {
  // Use the config name if no name is passed
  if (!name) {
    name = config.get("name")
  }

  return new Promise(function(resolve, reject) {
    // Create a new client (connecting to `template1`)
    var client = new pg.Client({
      user: config.get("user"),
      password: config.get("password"),
      port: config.get("port"),
      host: config.get("host"),
      database: "template1",
    })

    // Establish a connection
    client.connect(function() {
      // Force-ably remove all established connections to this database
      var text = (
        "SELECT pg_terminate_backend(pg_stat_activity.pid) " +
        "FROM pg_stat_activity " +
        "WHERE pg_stat_activity.datname = '" + name + "' " +
        "AND pid <> pg_backend_pid()"
      )

      client.query(text, function(err) {
        // Handle and reject if an error occurred
        if (err) {
          client.end()
          return reject(err)
        }

        // Drop the database (if it exists)
        text = "DROP DATABASE IF EXISTS " + name
        client.query(text, function(err) {
          client.end()

          // Handle and reject if an error occurred
          if (err) {
            return reject(err)
          }

          return resolve()
        })
      })
    })
  })
}

export default {
  create,
  drop
}
