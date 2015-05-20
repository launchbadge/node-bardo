import _ from "lodash"
import log from "../log"
import microtime from "microtime"
import Promise from "bluebird"

// TODO: Proper parsing of OID types into javscript equivalents
export default function execute(statement, values) {
  // Check if we're in an active session
  let d = process.domain
  if (d == null ||
      d.context == null ||
      d.context.bardo == null) {
    // TODO: Report an error that we weren't in an active session
    return
  }

  let ctx = d.context.bardo

  // If we have not yet executed a statement yet, execute a BEGIN statement
  // Unless this statement text is a BEGIN
  if (ctx.count === 0 && statement !== "BEGIN") {
    return execute("BEGIN").then(next)
  } else {
    return next()
  }

  function next() {
    return new Promise(function(resolve, reject) {
      if (!(typeof statement === "string" || statement instanceof String)) {
        // The statement is not a string assuming that this is a prepared
        // statement from sql-bricks
        var params = statement.toParams()
        statement = params.text
        values = params.values
      }

      // Trim the statement
      statement = statement.trim()

      // Default values to an empty array
      values = values || []

      // TRACE: Get the current clock time
      let now = microtime.now()

      // Send the statement
      ctx.client.query(statement, values, function(err, result) {
        // Handle and reject if an error occurred
        if (err) return reject(err)

        // TRACE: Calculate the elasped time and log the SQL statement
        let elapsed = +((microtime.now() - now) / 1000).toFixed(2)
        log.trace({id: ctx.id, elapsed}, statement)

        // DEBUG: Increment the per-session counters
        ctx.elapsed += elapsed
        ctx.count += 1

        // Parse (and resolve) the result proxy
        if (!_.isFinite(result.rowCount)) {
          // This doesn't support a sane row count resolve with nothing
          resolve()
        } else if (result.fields == null) {
          // Resolve the row count
          resolve(result.rowCount)
        } else {
          // Resolve the rows
          resolve(result.rows)
        }
      })
    })
  }
}
