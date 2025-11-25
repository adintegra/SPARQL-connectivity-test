import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const RUN_COUNT = 10
const DELAY_MS = 5000

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const scriptPath = resolve(__dirname, 'test-https-query.js')

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function runSingleIteration(iteration) {
  return new Promise((resolve, reject) => {
    console.log(`\n=== Run ${iteration + 1} of ${RUN_COUNT} ===`)

    const child = spawn(
      'node',
      [scriptPath],
      {
        stdio: 'inherit',
        env: process.env
      }
    )

    child.on('exit', code => {
      if (code === 0) {
        console.log(`Run ${iteration + 1} completed successfully.`)
        resolve()
      } else {
        reject(new Error(`Run ${iteration + 1} failed with exit code ${code}`))
      }
    })

    child.on('error', reject)
  })
}

async function main() {
  for (let i = 0; i < RUN_COUNT; i++) {
    try {
      await runSingleIteration(i)
    } catch (error) {
      console.error(error.message)
      process.exit(1)
    }

    if (i < RUN_COUNT - 1) {
      console.log(`Waiting ${DELAY_MS / 1000} seconds before next run...\n`)
      await sleep(DELAY_MS)
    }
  }

  console.log(`\nAll ${RUN_COUNT} runs completed.`)
}

main()
