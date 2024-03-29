# REST API Linting Action

[![.github/workflows/ci.yaml](https://github.com/istreamlabs/rest-api-lint/workflows/.github/workflows/ci.yaml/badge.svg)](https://github.com/istreamlabs/rest-api-lint/actions?query=workflow%3A.github%2Fworkflows%2Fci.yaml) [![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/istreamlabs/rest-api-lint)](https://hub.docker.com/r/istreamlabs/rest-api-lint) [![Docker Pulls](https://img.shields.io/docker/pulls/istreamlabs/rest-api-lint)](https://hub.docker.com/r/istreamlabs/rest-api-lint)

A Docker image with opinionated REST API linting for iStreamPlanet. Supports GitHub Actions.

This is built using [Stoplight's Spectral](https://stoplight.io/open-source/spectral). The custom ruleset is defined in [isp-rules.yaml](https://github.com/istreamlabs/rest-api-lint/blob/master/isp-rules.yaml), where you can find the descriptions and rule names (if you want to disable individual rules).

## Usage

There are two recommended ways to use this:

1. GitHub Actions
2. Any system that supports Docker images

### GitHub Actions Example

Set up a workflow that uses this image to do API linting and you are done:

```yaml
on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    name: Build & Test
    steps:
      - uses: actions/checkout@v1
      - name: API Lint
        uses: istreamlabs/rest-api-lint@master
        with:
          filename: path/to/openapi.yaml
```

The path you pass should be relative to the checkout directory, which is automatically mounted in the container and becomes the working directory.

### Docker Example

While similar to the above, you will need to do an extra step when using Docker directly. You must ensure that the working directory gets mounted properly into the container.

You can either use the published [`istreamlabs/rest-api-lint`](https://hub.docker.com/r/istreamlabs/rest-api-lint) container or build it yourself locally.

```sh
# Create the image.
$ docker build -t rest-api-lint .

# Mount the current working directory to `/tmp` in the container and run linting.
$ docker run -it -v $(pwd):/tmp rest-api-lint:latest /tmp/my-openapi.yaml

# If you have a custom `.spectral.yaml` with overrides:
$ docker run -it -w /workspace -v $(pwd):/workspace rest-api-lint:latest openapi.yaml
```

The command will return a `0` on success and a `1` if any errors are found. Warnings do not trigger a failure.

### Exceptions & Overrides

When [stoplightio/spectral#747](https://github.com/stoplightio/spectral/issues/747) gets fixed you will be able to provide individual exceptions on a case-by-case basis.

To disable an entire rule, e.g. to support a legacy API, you can provide your own `.spectral.yaml` file in the root of your repo which sets some rules to `false`. Note that this disables the rule for the _entire file_:

```yaml
rules:
  iso8601: false
  server-version: false
```

It's also possible to set it to `warn` or `info`.

The `extends` field is automatically added (or appended to) by the linter script to inject the iSP ruleset into your config.

### Local Development

1. Install `node 13.14.0` locally.
2. Run `npm run build` to compile the `isp-functions`.
3. Run `node ./entrypoint.js <PATH_TO_OPENAPI_SPEC>` to run the linter.

The `build` command may need to be re-run to pick up changes made to some of the `isp-functions`.

#### Tests

```sh
# Compile the isp-functions
npm run build

# Run test
npm run test
```

## License

Copyright © 2020 iStreamPlanet Co., LLC

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
