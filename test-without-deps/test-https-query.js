import https from 'https'

const endpointUrl = 'https://test.lindas.admin.ch/query'

// const defaultQuery = `
// PREFIX schema: <http://schema.org/>
// SELECT ?unversionedIri WHERE {
//   ?unversionedIri schema:hasPart <https://culture.ld.admin.ch/sfa/StateAccounts_Office/4/> .
// }
// LIMIT 10
// `

// const defaultQuery = `
// PREFIX schema: <http://schema.org/>
// SELECT ?unversionedIri WHERE {
//   ?unversionedIri schema:hasPart <https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/19> .
// }
// LIMIT 10
// `

const defaultQuery = `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT * WHERE {
  ?sub ?pred ?obj .
} LIMIT 10
`

const REQUEST_TIMEOUT_MS = 60000

function executeSparqlQuery(query) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpointUrl)
    const body = Buffer.from(query, 'utf8')

    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/sparql-query',
        Accept: 'application/sparql-results+json',
        'Content-Length': body.length
      }
    }

    const req = https.request(options, res => {
      let chunks = ''

      res.setEncoding('utf8')
      res.on('data', chunk => {
        chunks += chunk
      })

      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(
            new Error(
              `HTTP ${res.statusCode} ${res.statusMessage || ''}:\n${chunks}`
            )
          )
        }

        try {
          const payload = JSON.parse(chunks)
          resolve(payload)
        } catch (parseError) {
          reject(
            new Error(
              `Failed to parse JSON response: ${
                parseError.message
              }\nRaw response:\n${chunks}`
            )
          )
        }
      })
    })

    req.on('error', reject)

    req.setTimeout(REQUEST_TIMEOUT_MS, () => {
      req.destroy(new Error(`Request timed out after ${REQUEST_TIMEOUT_MS / 1000}s`))
    })

    req.write(body)
    req.end()
  })
}

function printResults(payload) {
  const bindings = payload?.results?.bindings || []

  console.log(`✓ Received ${bindings.length} binding(s)`)

  bindings.slice(0, 5).forEach((binding, index) => {
    console.log(`\nResult ${index + 1}`)
    Object.entries(binding).forEach(([key, value]) => {
      console.log(`  ${key}: ${value.value} (${value.type || value.termType})`)
    })
  })

  if (bindings.length === 0) {
    console.log('Note: Empty result set (might be normal for this query).')
  } else if (bindings.length > 5) {
    console.log(`\n...and ${bindings.length - 5} more result(s).`)
  }
}

async function main() {
  const cliQuery = process.argv.slice(2).join(' ').trim()
  const queryToRun = cliQuery.length > 0 ? cliQuery : defaultQuery

  console.log(`Testing SPARQL connectivity via HTTPS: ${endpointUrl}`)
  console.log('Sending query...\n')

  try {
    const response = await executeSparqlQuery(queryToRun)
    console.log('✓ Query succeeded\n')
    printResults(response)
    process.exit(0)
  } catch (error) {
    console.error('✗ Query failed\n')
    console.error(error.message)
    process.exit(1)
  }
}

main()
