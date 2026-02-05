import { lintSchemas } from "./schema/lintSchemas.js"
import { lintBoundary } from "./boundary/lintBoundary.js"
import { lintCross } from "./cross/lintCross.js"

async function main() {
  await lintSchemas()
  await lintBoundary()
  await lintCross()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
