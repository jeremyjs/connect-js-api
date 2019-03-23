# connect-js-api
[![Build Status](https://travis-ci.org/spotware/connect-js-api.svg?branch=master)](https://travis-ci.org/spotware/connect-js-api)

A connector SDK for [Spotware Connect Open API](https://connect.spotware.com/docs/api-reference) in JavaScript and Node.js

## TODO
* -Update dependency versions to latest stable (jeremyjs forks)-
* Tag new stable version of `jeremyjs/connect-protobuf-messages` (currently depending on a branch)
* `codec.encode` does not return a consistent type
* `Buffer()` is deprecated, use `Buffer.from()`
* Coverage messes w/ stack trace; switch to `nyc` cli
* Write unit tests for all units and methods
* Handle promise rejections
