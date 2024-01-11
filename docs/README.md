# Getting Started

## Introduction

fsx is a modern filesystem library for JavaScript runtimes. The overall goal is to create an enjoyable, flexible, observable library for filesystem operations that adheres more to modern API design than Linux utility design.

## Choosing a Runtime Package

To get started, choose which runtime package you'd like to use:

-   `fsx-node` - fsx implementation that runs on top of the Node.js `fs/promises` module
-   `fsx-deno` - fsx implementation that runs on top of the `Deno` global
-   `fsx-memory` - fsx implementation that runs in memory and is suitable for any JavaScript runtime

This document uses `fsx-node` as an example, but the API for each runtime package is effectively the same.

## Installation

Install the `fsx-node` package using your favorite npm CLI tool:

```shell
npm install fsx-node
# or
yarn add fsx-node
# or
pnpm install fsx-node
# or
bun install fsx-node
```

> [!IMPORTANT] > `fsx-node` requires Node.js v18.18.0 or later.

## Importing the Library

To get started using the API, import the `fsx` singleton from the runtime package, like this:

```js
import { fsx } from "fsx-node";
```

You can then use `fsx` in most places where you would use the runtime's filesystem API, such as `fs` for Node.js.

## Using the Library

For information about using the `fsx` object, please see the following:

-   [File Operations](./file-operations.md)
-   [Directory Operations](./directory-operations.md)
-   [Logging](./logging.md)
-   [Using Impls](./using-impls.md)
