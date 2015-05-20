
// Drivers
//  - Postgres (*)
//  - MySQL
//  - SQLITE

// Database
// let rows = await db.select("*").from("tablename")

// Session
// The idea would be to re-use the same connection checkout for all database
// operations in a domain

// Transaction
// Something simple as hell like sqlalchemy
await db.begin()
// await db.commit()
// await db.rollback()

// CRUD

// SELECT ...
// UPDATE
// DELETE
//

// Tasks
// [ ] Session / Connection / Pool
