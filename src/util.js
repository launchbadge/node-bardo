import _ from "lodash"
import Str from "underscore.string"

// Transform from `addr__name_id` to `addr.nameId`
// TODO: Memoize to improve performance
export function serialize(row) {
  if (row == null) return null
  return _.transform(row, function(result, value, key) {
    let segments = key.split("__")
    let record = result

    for (let seg of segments.slice(0, segments.length - 1)) {
      let name = Str.camelize(seg)

      if (record[name] == null) {
        record[name] = {}
      }

      record = record[name]
    }

    let name = Str.camelize(segments[segments.length - 1])
    record[name] = row[key]
  })
}

// Transform from `addr.nameId` to `addr__name_id`
// TODO: Memoize to improve performance
export function deserialize(item) {
  if (item == null) return null

  let row = {}

  function clean(value) {
    if (value instanceof require("buffer").Buffer) {
      // Buffers need to be encoded
      value = "\\x" + value.toString("hex")
    }

    return value
  }

  function expand(obj, prefix) {
    _.each(obj, function(value, key) {
      let text = Str.underscored(key)
      let name = prefix ? prefix + "__" + text : text
      if (_.isPlainObject(value)) {
        expand(value, name)
      } else {
        row[name] = clean(value, name)
      }
    })
  }

  expand(item, null)

  return row
}

export default {
  serialize,
  deserialize
}
