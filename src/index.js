// require("bardo") === db
module.exports = require("./db").default

// NOTE: This is for backwards compatibility
module.exports.db = module.exports

// Attach additional properties
module.exports.configure = require("./config").configure
module.exports.database = require("./database").default
module.exports.util = require("./util").default
module.exports.Model = require("./model").default
