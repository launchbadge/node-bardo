import _ from "lodash"
import {Pool} from "generic-pool"
import {native as pg} from "pg"

process.env.SUPPRESS_NO_CONFIG_WARNING = "y"
let config = require("config")

let pool = new Pool({
  create(next) {
    let client = new pg.Client(config.get("bardo.db"))
    client.connect(function(err) {
      if (err) next(err)
      else next(null, client)
    })
  },

  destroy(client) {
    client.end()
  },

  // Maximum number of resources to create at any given time (default=1)
  // TODO: Make configurable
  max: 20,

  // Minimum number of resources to keep in pool at any given time
  // TODO: Make configurable
  min: 0,

  // Max milliseconds a resource can go unused before it should be destroyed
  idleTimeoutMillis: 30000,

  // if true, logs via console.log - can also be a function
  // NOTE: Investigate
  log: false
})

export default pool

// Hook into termination and interrupt signals to gracefully exit
let gracefulExit = _.once(function() {
  pool.drain(function() {
    pool.destroyAllNow()
  })
})

process.on("SIGTERM", gracefulExit)
process.on("SIGINT", gracefulExit)
