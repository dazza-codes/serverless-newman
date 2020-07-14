# Serverless Newman

A serverless project that executes postman tests via newman in AWS lambda and
writes test results to cloudwatch logs using winston. The lamdba will return
with an error if the test fails / does not complete.

## Installation

First, install all node dependencies into `layer/nodejs/node_modules`:

```sh
# See also .yarnrc, it will create layer/nodejs/node_modules/*
yarn install
```

Make sure to have the serverless framework installed (globally).

## Deployment

Deploy the serverless project with

```sh
serverless deploy
```

You can invoke the function and validate if everything works with

```sh
serverless invoke -f run-newman-test
```

The lambda should return `"Test run passed!"` if everything works as
expected. (The project executed the test collection available in
`/testsuites` in newman and all tests passed.)

## Configuration

The project uses the [node config
module](https://github.com/lorenwest/node-config) for configuration. Hence,
check out `default.json` for default config options and
`custom-environment-variables.json` for available environment variables.

### Newman Test Environment Variables

Every test-run generates a new environment based on environment variables
specified in the configuration or through the event of the lamdba function.

#### Newman Test Environment Varaibles from configuration

All variables specified under `testEnvironmentVariables` are passed to the
test as specified in `config/default.json`.

#### Newman Test Environment Varaibles from lambda event

Variables provided under the key `testEnvironmentVariables` of the lambda
event are passed to the test. If a variable is specified in both the config
file and in the lambda event, the value in the lambda event will overwrite
the value specified in the config file.

Example of a lambda event containting environment variables for a test-run:

```json
{
    "testEnvironmentVariables": {
        "myEnvVar": "abcd"
    }
}
```

## References

- https://medium.com/@anjanava.biswas/nodejs-runtime-environment-with-aws-lambda-layers-f3914613e20e
- https://medium.com/the-cloud-builders-guild/how-to-add-nodejs-library-dependencies-in-a-aws-lambda-layer-with-serverless-framework-d774cb867197
