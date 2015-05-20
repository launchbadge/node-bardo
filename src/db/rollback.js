import execute from "./execute"

export default function rollback() {
  return execute("ROLLBACK")
}
