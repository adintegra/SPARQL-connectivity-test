import SparqlClient from 'sparql-http-client'

class SparqlQueryExecutor {
  constructor(endpointUrl) {
    this.client = new SparqlClient({ endpointUrl })
  }

  async executeQuery(query) {
    return new Promise((resolve, reject) => {
      const results = []
      const stream = this.client.query.select(query)

      stream.on('data', row => {
        results.push(row)
      })

      stream.on('error', err => {
        reject(err)
      })

      stream.on('end', () => {
        resolve(results)
      })
    })
  }
}

export default SparqlQueryExecutor
