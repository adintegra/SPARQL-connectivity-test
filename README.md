# SPARQL Query Executor

A simple JavaScript class for executing SPARQL queries using the [sparql-http-client](https://github.com/rdf-ext/sparql-http-client) library.

## Installation

Install dependencies:

```bash
npm install
```

## Usage

### Test Connection

Test connectivity to the SPARQL endpoint:

```bash
node test-connection.js
```

Or using npm:

```bash
npm run test-connection
```

### Using the Class

```javascript
import SparqlQueryExecutor from './SparqlQueryExecutor.js'

const executor = new SparqlQueryExecutor('https://int.lindas.admin.ch/query')

const query = `
  SELECT ?s ?p ?o WHERE {
    ?s ?p ?o
  }
  LIMIT 10
`

try {
  const results = await executor.executeQuery(query)
  results.forEach(row => {
    console.log(row)
  })
} catch (error) {
  console.error('Query failed:', error)
}
```

## Files

- `SparqlQueryExecutor.js` - The main class for executing SPARQL queries
- `test-connection.js` - Script to test connectivity to the SPARQL endpoint
