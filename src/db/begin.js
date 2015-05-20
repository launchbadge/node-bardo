import pool from "../pool"
import execute from "./execute"
import domain from "domain"

export default function begin() {
  return new Promise(function(resolve, reject) {
    // If we are not in a domain; we need to create a domain
    let d = process.domain
    let inDomain = true
    if (d == null) {
      d = domain.create()
      inDomain = false
    }

    // If we were not in the domain; put us in it now
    if (inDomain) next()
    else d.run(next)

    function next() {
      // Acquire the (possibly new) client from the pool
      pool.acquire(function(err, client) {
        if (err) return reject(err)

        // Initialize the domain context
        if (d.context == null) d.context = {}
        d.context.client = client

        // Execute a BEGIN statement to begin a transaction
        execute("BEGIN").then(function() {
          // Now resolve with the acquired client
          resolve(client)
        })
      })
    }
  })
}
