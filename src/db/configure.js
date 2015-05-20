process.env.SUPPRESS_NO_CONFIG_WARNING = "y"
let config = require("config")

export default function configure(options={}) {
  var defaults = {
    // Logging configuration
    log: {
      // The defined level to show
      level: "trace",
    },

    // The database connection information
    db: {
      // SQL username [defaults to `process.env.USER`]
      user: null,

      // Password for the SQL username
      password: null,

      // SQL database to use [defaults to `process.env.USER`]
      database: null,

      // Port to use when connecting to the database server [defaults
      //  to the appropriate value depending on `driver`]
      port: null,

      // Host address of the database server [defaults to `127.0.0.1`]
      host: "127.0.0.1",
    },
  }

  config.util.extendDeep(defaults, options)
  config.util.setModuleDefaults("bardo", defaults)
}
