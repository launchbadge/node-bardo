// TODO: There has got to be an easier way to do this
import fs from "fs"
import path from "path"

let index = {}

for (let filename of (fs.readdirSync(__dirname))) {
  let {name, ext} = path.parse(filename)
  if (ext === ".js" && name !== "index") {
    index[name] = require(`./${name}`)
  }
}

export default index
