# /tests

As of v1.0.2, [Jest JS](https://jestjs.io/) is being used for all tests.
A dedicated testing framework might be setup later as the project expands.

## Folder structure

- **/simple** contains tests for all the flows of the system ensuring response status and body schema.
- **raw_data.js** contains entire testing data.
- **constants.js** contains the data & endpoints to be passed to each test suite.

## Running tests

Before running tests, it is necessary to build the project first. So run `npm run build` followed by `npm run test`

In the case of testing a particular module, run:

```npx jest --coverage [module]```
