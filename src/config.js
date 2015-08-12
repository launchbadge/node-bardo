process.env.SUPPRESS_NO_CONFIG_WARNING = "y"
var config = require("config")

var pg = require("pg").native

// Declare default configuration
let defaults = {
  // Logging configuration; the defined level to show
  log: "trace",

  // SQL username [defaults to `process.env.USER`]
  user: "postgres",

  // Password for the SQL username
  password: null,

  // SQL database to use [defaults to `process.env.USER`]
  name: null,

  // Port to use when connecting to the database server [defaults
  //  to the appropriate value depending on `driver`]
  port: null,

  // Host address of the database server [defaults to `127.0.0.1`]
  host: "127.0.0.1",

  // Pool configuration
  pool: {
    // Number of unique Client objects to maintain in the pool.
    size: 25,

    // Max milliseconds a client can go unused before it is removed from
    // the pool and destroyed.
    timeout: 30000,
  }
}

// Setup default configuration
config.util.setModuleDefaults("db", defaults)

export function has(key) {
  return config.has(`db.${key}`)
}

export function get(key) {
  return config.get(`db.${key}`)
}

// Configure postgres
pg.defaults.parseInt8 = true
pg.defaults.poolSize = get("pool.size")
pg.defaults.poolIdleTimeout = get("pool.timeout")

export default {
  get,
  has
}
