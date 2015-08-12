import db from "../lib/db"

after(function() {
  // After execution close all open db connections
  db.quit()
})
