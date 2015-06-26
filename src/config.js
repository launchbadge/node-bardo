process.env.SUPPRESS_NO_CONFIG_WARNING = 'y';
var config = require('config');

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
}

// Setup default configuration
config.util.setModuleDefaults('db', defaults);

export function configure(options = {}) {
  // Mixin configs that have been passed in, and make those my defaults
  config.util.extendDeep(defaults, options);
  config.util.setModuleDefaults('db', defaults);
}

export function has(key) { return config.has(`db.${key}`) }
export function get(key) { return config.get(`db.${key}`) }

export default {
  configure,
  get,
  has
}
