import SparqlQueryExecutor from './SparqlQueryExecutor.js'


// REF
const endpointUrl = 'https://lindas-cached.test.cluster.ldbar.ch/query'
// const endpointUrl = 'https://test.lindas.admin.ch/query'

// INT
// const endpointUrl = 'https://lindas-cached.int.cluster.ldbar.ch/query'
// const endpointUrl = 'https://int.lindas.admin.ch/query'

//PROD
// const endpointUrl = 'https://lindas.admin.ch/query'


// Simple test query to check connectivity
// const testQuery = `
//   SELECT ?s ?p ?o WHERE {
//     ?s ?p ?o
//   }
//   LIMIT 5
// `

const testQuery = `
PREFIX schema: <http://schema.org/>
SELECT ?unversionedIri WHERE {
  ?unversionedIri schema:hasPart <https://culture.ld.admin.ch/sfa/StateAccounts_Office/4/> .
}
`

// Timeout in milliseconds (60 seconds)
const TIMEOUT_MS = 60000

function createTimeoutPromise(ms) {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Query timed out after ${ms / 1000} seconds`))
    }, ms)
  })
}

function formatError(error) {
  let errorDetails = {
    message: error.message || 'Unknown error',
    type: error.constructor.name || 'Error'
  }

  // Check for HTTP errors
  if (error.status || error.statusCode) {
    errorDetails.httpStatus = error.status || error.statusCode
    errorDetails.httpStatusText = error.statusText || ''
  }

  // Check for network errors
  if (error.code) {
    errorDetails.code = error.code
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      errorDetails.message = `Network error: Cannot connect to ${endpointUrl}`
    }
  }

  // Check for response body if available
  if (error.body) {
    errorDetails.body = error.body
  }

  return errorDetails
}

async function testConnection() {
  console.log(`Testing connection to: ${endpointUrl}`)
  console.log('Executing test query...\n')

  try {
    const executor = new SparqlQueryExecutor(endpointUrl)

    // Race between query and timeout
    const queryPromise = executor.executeQuery(testQuery)
    const timeoutPromise = createTimeoutPromise(TIMEOUT_MS)

    const results = await Promise.race([queryPromise, timeoutPromise])

    console.log('✓ Connection successful!')
    console.log(`✓ Query completed successfully`)
    console.log(`✓ Received ${results.length} result(s)\n`)

    if (results.length > 0) {
      console.log('Sample results:')
      results.forEach((row, index) => {
        console.log(`\nResult ${index + 1}:`)
        for (const [key, value] of Object.entries(row)) {
          console.log(`  ${key}: ${value.value} (${value.termType})`)
        }
      })
    } else {
      console.log('Note: Query returned no results (this may be normal)')
    }

    console.log('\n✓ Test completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('\n✗ Query failed!')
    console.error('='.repeat(50))

    const errorDetails = formatError(error)

    console.error(`Error Type: ${errorDetails.type}`)
    console.error(`Error Message: ${errorDetails.message}`)

    if (errorDetails.httpStatus) {
      console.error(`HTTP Status: ${errorDetails.httpStatus} ${errorDetails.httpStatusText || ''}`)
    }

    if (errorDetails.code) {
      console.error(`Error Code: ${errorDetails.code}`)
    }

    if (errorDetails.body) {
      console.error(`Response Body: ${errorDetails.body}`)
    }

    // Print full error stack in development
    if (process.env.DEBUG) {
      console.error('\nFull error stack:')
      console.error(error.stack)
    }

    console.error('='.repeat(50))
    process.exit(1)
  }
}

testConnection()
