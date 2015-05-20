var config = require("config");

export default function execute(statement, values) {
  // Check if we're in an active session
  let d = process.domain
  if (d == null ||
      d.context == null ||
      d.context.client == null) {
    // TODO: Report an error that we weren't in an active session
    return
  }

  return new Promise(function(resolve, reject) {
    if (!(typeof statement === "string" || statement instanceof String)) {
      // The statement is not a string; assuming that this is a prepared
      // statement from sql-bricks
      var params = statement.toParams()
      statement = params.text
      values = params.values
    }

    // Default values to an empty array
    values = values || []

    // TODO: Make this configurable (disable-able); we need a nice way of
    //  logging that can log performance of each query and on an end
    //  can log query count and total time taken of all queries
    console.log(statement)

    // Send the statement
    d.context.client.query(statement, values, function(err, result) {
      // Handle and reject if an error occurred
      if (err) return reject(err)

      // Resolve the result proxy
      return resolve(result)
    });
  })
}
