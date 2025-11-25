## SPARQL Connectivity Smoke Tests (No Dependencies)

This folder contains lightweight HTTPS-only scripts to verify that the `https://test.lindas.admin.ch/query` endpoint is reachable without relying on external libraries.

- `test-https-query.js` – single-run probe that POSTs a default `SELECT * WHERE { ?s ?p ?o } LIMIT 10` query and prints the bindings. You can override the query by passing it on the command line (wrap multi-line queries in quotes). Example:

  ```
  NODE_TLS_REJECT_UNAUTHORIZED=0 node test-https-query.js "SELECT ?s ?p ?o WHERE { ?s ?p ?o } LIMIT 5"
  ```

- `loop-sparql-tests.js` – spawns the single-run probe 10 times with a 5 s delay to catch intermittent issues. It inherits the current environment, so set TLS or proxy variables before running:

  ```
  NODE_TLS_REJECT_UNAUTHORIZED=0 node loop-sparql-tests.js
  ```

> **Note:** Disabling TLS verification is insecure and should only be used when testing against known hosts with temporary certificate problems. Remove `NODE_TLS_REJECT_UNAUTHORIZED=0` once the endpoint serves a trusted certificate.
