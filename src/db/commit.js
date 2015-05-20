import execute from "./execute"

export default function commit() {
  return execute("COMMIT")
}
