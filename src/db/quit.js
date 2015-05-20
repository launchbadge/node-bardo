import pool from "../pool"

// Schedule immediate termination (as soon as all active sessions
// call `.exit`). This is not the normal behavior as the pool normally
// stays open so a future `.begin` can acquire the connection. This is
// quite useful in scratch scripting though.
export default function quit() {
  return new Promise(function(resolve) {
    pool.drain(function() {
      pool.destroyAllNow()
      resolve()
    })
  })
}
