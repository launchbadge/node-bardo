import _ from "lodash"
import {native as pg} from "pg"

// NOTE: This must be `require` (and not `import`) as it must happen
//       after the `process.env` configuration
process.env.SUPPRESS_NO_CONFIG_WARNING = "y"
let configModule = require("config")

// Declare default configuration
let defaults = {
  // Name for logging
  name: configModule.has("name") ? configModule.get("name") : "Bardo",

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

  // Automatically commit after each `execute`
  autoCommit: false,

  // Pool configuration
  pool: {
    // Number of unique Client objects to maintain in the pool.
    size: 10,

    // Max milliseconds a client can go unused before it is removed from
    // the pool and destroyed.
    timeout: 30000,
  }
}

// Setup default configuration
configModule.util.setModuleDefaults("db", defaults)

// Pull configuration store from "node-config"
let config = _.cloneDeep(configModule.get("db"))

export function get(key) {
  let names = key.split(".")
  let result = config
  for (let name of names) {
    result = result[name]

    // Short-circuit in case of `x.y` where `x` is null
    if (result == null) {
      return result
    }
  }

  return result
}

export function has(key) {
  return get(key) != null
}

// Configure merges in new options with the config store
export function configure(options) {
  if (options != null) {
    _.merge(config, options)
  }

  // Configure postgres
  pg.defaults.parseInt8 = true
  pg.defaults.poolSize = get("pool.size")
  pg.defaults.poolIdleTimeout = get("pool.timeout")
}

// Bootstrap
configure()

export default {
  configure,
  get,
  has
}
