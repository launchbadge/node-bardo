import bunyan from "bunyan"
import config from "config"

// Create a stdout pipe (if during tests)
var stdout = process.stdout
if (process.env.NODE_ENV === "test") {
  var PrettyStream = require("bunyan-prettystream")

  stdout = new PrettyStream()
  stdout.pipe(process.stdout)
}

let log = bunyan.createLogger({
  name: "bardo",
  stream: stdout,
  level: config.get("bardo.log.level")
})

export default log
