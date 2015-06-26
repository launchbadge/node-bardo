import _ from "lodash"
import {Pool} from "generic-pool"
import {native as pg} from "pg"
import config from "./config"

let pool = new Pool({
  create(next) {
    let client = new pg.Client({
      user: config.get("user"),
      password: config.get("password"),
      database: config.get("name"),
      port: config.get("port"),
      host: config.get("host"),
    })

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
