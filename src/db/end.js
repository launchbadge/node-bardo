import log from "../log"
import execute from "./execute"

// End the current session and release the acquired connection
// to the connection pool.
export default function end() {
  let d = process.domain
  if (d == null ||
      d.context == null ||
      d.context.bardo == null) {
    // TODO: Report an error that we weren't in an active session
    return null
  }

  return new Promise(function(resolve, reject) {
    function next() {
      // Release our client from the pool
      d.context.bardo.done()

      // DEBUG: Report total SQL execution time for this session
      let {id, elapsed, count} = d.context.bardo
      elapsed = elapsed.toFixed(2)
      if (count > 0) {
        log.debug({id, elapsed: `${elapsed}ms`, count},
          `${count} statement${count > 1 ? "s" : ""} executed in ${elapsed}ms`)
      }

      // Remove us from the domain
      delete d.context.bardo

      // Leave our domain
      d.exit()
      resolve()
    }

    // If we are currently in a transaction; rollback the transaction
    if (d.context.bardo.inTransaction) {
      execute("ROLLBACK").then(next).catch(reject)
    } else {
      next()
    }
  })
}
