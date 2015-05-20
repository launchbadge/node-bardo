import db from "../lib/db"

// Attach bluebird as the promise handler
global.Promise = require("bluebird")

after(function() {
  // After execution; close all open db connections
  db.quit()
})
