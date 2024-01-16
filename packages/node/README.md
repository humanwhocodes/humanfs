# `fsx-node`

by [Nicholas C. Zakas](https://humanwhocodes.com)

If you find this useful, please consider supporting my work with a [donation](https://humanwhocodes.com/donate) or [nominate me](https://stars.github.com/nominate/) for a GitHub Star.

## Description

The `fsx` bindings for use in Node.js and Node.js-compatible runtimes.

> [!WARNING]
> This project is **experimental** and may change significantly before v1.0.0. Use at your own caution and definitely not in production!

## Installation

Install using your favorite package manager:

```shell
npm install fsx-node

# or

pnpm install fsx-node

# or

yarn add fsx-node

# or

bun install fsx-node
```

## Usage

The easiest way to use fsx in your project is to import the `fsx` object:

```js
import { fsx } from "fsx-node";
```

Then, you can use the API methods:

```js
// 1. Files

// read from a text file
const text = await fsx.text("file.txt");

// read from a JSON file
const json = await fsx.json("file.json");

// read raw bytes from a text file
const arrayBuffer = await fsx.arrayBuffer("file.txt");

// write text to a file
await fsx.write("file.txt", "Hello world!");

// write bytes to a file
await fsx.write("file.txt", new TextEncoder().encode("Hello world!"));

// does the file exist?
const found = await fsx.isFile("file.txt");

// delete a file
await fsx.delete("file.txt");

// 2. Directories

// create a directory
await fsx.createDirectory("dir");

// create a directory recursively
await fsx.createDirectory("dir/subdir");

// does the directory exist?
const dirFound = await fsx.isDirectory("dir");

// delete a directory
await fsx.delete("dir");
```

If you'd like to create your own instance, import the `NodeFsx` constructor:

```js
import { NodeFsx } from "fsx-node";
import fsp from "fs/promises";

const fsx = new NodeFsx();

// optionally specify the fs/promises object to use
const fsx = new NodeFsx({ fsp });
```

If you'd like to use just the impl, import the `NodeFsxImpl` constructor:

```js
import { NodeFsxImpl } from "fsx-node";
import fsp from "fs/promises";

const fsx = new NodeFsxImpl();

// optionally specify the fs/promises object to use
const fsx = new NodeFsxImpl({ fsp });
```

## Errors Handled

* `ENOENT` - in most cases, these errors are handled silently.
* `ENFILE` and `EMFILE` - calls that result in these errors are retried for up to 60 seconds before giving up for good.

## License

Apache 2.0
