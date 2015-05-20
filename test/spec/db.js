import {expect} from "chai"
import db from "../../lib/db"

describe("bardo/db", function() {
  it("should exist", function() {
    expect(db).to.exist
    expect(db.execute).to.exist
  })

  describe("begin", function() {
    it("should establish a domain context", async function() {
      await db.begin()

      expect(process.domain.context).to.exist
      expect(process.domain.context.bardo).to.exist
      expect(process.domain.context.bardo.client).to.exist

      await db.end()
    })
  })

  describe("execute", function() {
    before(async function() {
      await db.begin()

      await db.execute(`
        CREATE TABLE IF NOT EXISTS example (
          id serial PRIMARY KEY,
          name text
        )
      `)

      await db.commit()
      await db.end()
    })

    after(async function() {
      await db.begin()
      await db.execute("DROP TABLE example")
      await db.commit()
      await db.end()
    })

    it("should return the rows", async function() {
      await db.begin()

      let res = null
      res = await db.execute("INSERT INTO example (name) VALUES ('Red')")
      expect(res).to.equal(1)

      res = await db.execute("INSERT INTO example (name) VALUES ('Green')")
      expect(res).to.equal(1)

      res = await db.execute("INSERT INTO example (name) VALUES ('Blue')")
      expect(res).to.equal(1)

      res = await db.execute("SELECT * FROM example")
      expect(res).to.have.length(3)
      expect(res[0].name).to.equal("Red")
      expect(res[2].name).to.equal("Blue")

      await db.rollback()
      await db.end()
    })

    it("should return the number of rows affected", async function() {
      await db.begin()

      let res = null
      res = await db.execute("INSERT INTO example (name) VALUES ('Red')")
      expect(res).to.equal(1)

      res = await db.execute("INSERT INTO example (name) VALUES ('Green')")
      expect(res).to.equal(1)

      res = await db.execute("INSERT INTO example (name) VALUES ('Blue')")
      expect(res).to.equal(1)

      res = await db.execute("DELETE FROM example")
      expect(res).to.equal(3)

      await db.rollback()
      await db.end()
    })
  })
})
