// TODO: This should probably work
// var db = require("bardo/db")

var {db} = require(".")

// Use promise as the global Promise object
// NOTE: This gives you nice error messages when things go wrong (instead of
// just hanging)
global.Promise = require("bluebird")

async function main() {

  // NOTE: This allows for configuration
  // TODO: This should by default use node-config so `.configure` is an
  //  optional step
  // db.configure({
  //   driver: "postgres",
  //   user: config.get("db.user"),
  //   password: config.get("db.password"),
  //   database: config.get("db.name"),
  //   host: config.get("db.host"),
  //   port: config.get("db.port"),
  // })

  // NOTE: Should be a way to run this without making a transaction
  let client = await db.begin()

  await db.execute(`
    CREATE TEMP TABLE example (
      id serial,
      name text
    )
  `)

  await db.execute(`
    INSERT INTO example (name) VALUES ('Hello') 
  `)

  await db.commit()
  await db.end()
  await db.quit()
}

main()
