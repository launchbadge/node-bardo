import config from "../config"
import domain from "domain"
import shortid from "shortid"
import {native as pg} from "pg"

export default function begin() {
  return new Promise(function(resolve, reject) {
    // If we are not in a domain we need to create a domain
    let d = domain.active
    if (d == null) {
      d = domain.create()
    }

    // Explicitly run inside the domain
    d.run(next)

    function next() {
      // Acquire the (possibly new) client from the pool
      pg.connect({
        user: config.get("user"),
        password: config.get("password"),
        database: config.get("name"),
        port: config.get("port"),
        host: config.get("host"),
      }, function(err, client, done) {
        if (err) return reject(err)

        // Initialize the domain context
        if (d.context == null) d.context = {}
        d.context.bardo = {
          id: shortid(),
          client,
          done,
          count: 0,
          elapsed: 0
        }

        // Execute a "BEGIN" statement to begin the transaction
        return require("./execute")("BEGIN").then(resolve).catch(reject)
      })
    }
  })
}
