import pool from "../pool"

// End the current session and release the acquired connection
// to the connection pool.
export default function end() {
  let d = process.domain
  if (d == null ||
      d.context == null ||
      d.context.client == null) {
    // TODO: Report an error that we weren't in an active session
    return
  }

  // Release our client from the pool
  pool.release(d.context.client)

  // Remove us from the domain
  delete d.context.client

  // Leave our domain
  d.exit()
}
