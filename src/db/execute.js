import _ from "lodash"
import log from "../log"
import microtime from "microtime"
import config from "../config"
import begin from "./begin"

// Assert that we have a database context
function assertContext() {
  return new Promise(function(resolve, reject) {
    // Check if we're in an active session
    let d = process.domain
    if (d == null ||
        d.context == null ||
        d.context.bardo == null) {
      // Begin the session before proceeding
      return begin().then(resolve).catch(reject)
    }

    // Continue onwards with our active domain
    return resolve()
  })
}

function assertTransaction(statement) {
  let ctx = process.domain.context.bardo
  return new Promise(function(resolve, reject) {
    if (/^begin/i.test(statement)) {
      // This statement is going to begin a transaction directly
      return resolve()
    }

    if (!ctx.inTransaction) {
      // We're not in a transaction; we should be
      return execute("BEGIN").then(resolve).catch(reject)
    }

    // Looks like everythign is good
    return resolve()
  })
}

// Actually execute the statement
function execute_(statement, values) {
  let ctx = process.domain.context.bardo
  return new Promise(function(resolve, reject) {
    if (/^begin/i.test(statement)) {
      // If this is a `BEGIN` statement; put us in a transaction
      ctx.inTransaction = true
    } else if (/^(commit|rollback)/i.test(statement)) {
      // Else if this is a `COMMIT` or `ROLLBACK` statement;
      // leave the transaction
      ctx.inTransaction = false
    }

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
      log.trace({
        id: ctx.id,
        elapsed: `${elapsed}ms`,
        values: (values && values.length) ? values : undefined
      }, statement)

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

function autoCommit(statement) {
  let ctx = process.domain.context.bardo
  if (config.get("autoCommit") && ctx.inTransaction) {
    if (!(/^(begin)/i.test(statement))) {
      return execute("COMMIT")
    }
  }

  return new Promise(resolve => { resolve() })
}

// TODO: Proper parsing of OID types into javscript equivalents
export default function execute(statement, values) {
  return new Promise(function(resolve, reject) {
    // Assert the database context
    return assertContext().then(function() {
      if (!(typeof statement === "string" || statement instanceof String)) {
        // The statement is not a string assuming that this is a prepared
        // statement from sql-bricks
        var params = statement.toParams()
        statement = params.text
        values = params.values
      }

      // Trim the statement
      statement = statement.trim()

      // Assert the transaction context
      return assertTransaction(statement).then(function() {
        // Execute the statement
        return execute_(statement, values).then(function() {
          return autoCommit(statement).then(resolve).catch(reject)
        }, reject)
      }).catch(reject)
    }).catch(reject)
  })
}
