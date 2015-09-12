// require("bardo") === db
module.exports = require("./db")

// NOTE: This is for backwards compatibility
module.exports.db = module.exports

// Attach additional properties
module.exports.configure = require("./config").configure
module.exports.database = require("./database")
module.exports.util = require("./util")
module.exports.Model = require("./model")
