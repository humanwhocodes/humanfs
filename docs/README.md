# Getting Started

## Introduction

humanfs is a modern filesystem library for JavaScript runtimes. The overall goal is to create an enjoyable, flexible, observable library for filesystem operations that adheres more to modern API design than Linux utility design.

## Design Overview

If you'd like to learn more about the design of humanfs, please read the [Design document](design.md).

## Choosing a Runtime Package

To get started, choose which runtime package you'd like to use:

-   `@humanfs/node` - humanfs implementation that runs on top of the Node.js `fs/promises` module
-   `@humanfs/deno` - humanfs implementation that runs on top of the `Deno` global
-   `@humanfs/web` - humanfs implementation that runs on top of the Origin Private File System in browsers
-   `@humanfs/memory` - humanfs implementation that runs in memory and is suitable for any JavaScript runtime

This document uses `@humanfs/node` as an example, but the API for each runtime package is effectively the same.

## Installation

Install the `@humanfs/node` package using your favorite npm CLI tool:

```shell
npm install @humanfs/node
# or
yarn add @humanfs/node
# or
pnpm install @humanfs/node
# or
bun install @humanfs/node
```

> [!IMPORTANT] > `@humanfs/node` requires Node.js v18.18.0 or later.

## Importing the Library

To get started using the API, import the `hfs` singleton from the runtime package, like this:

```js
import { hfs } from "@humanfs/node";
```

You can then use `hfs` in most places where you would use the runtime's filesystem API, such as `fs` for Node.js.

## Using the Library

For information about using the `hfs` object, please see the following:

-   [File Operations](./file-operations.md)
-   [Directory Operations](./directory-operations.md)
-   [Logging](./logging.md)
-   [Using Impls](./using-impls.md)
