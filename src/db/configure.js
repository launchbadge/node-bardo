import _ from "lodash"
import config from "../config"

export default function configure(options) {
  _.merge(config, options)
}
