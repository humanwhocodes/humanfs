# `fsx-deno`

by [Nicholas C. Zakas](https://humanwhocodes.com)

If you find this useful, please consider supporting my work with a [donation](https://humanwhocodes.com/donate) or [nominate me](https://stars.github.com/nominate/) for a GitHub Star.

## Description

The `fsx` bindings for use in Node.js and Node.js-compatible runtimes.

> [!WARNING]
> This project is **experimental** and may change significantly before v1.0.0. Use at your own caution and definitely not in production!

## Installation

Set up a `deno.json` file like this:

```json
{
	"imports": {
		"fsx-deno": "npm:fsx-deno@latest"
	}
}
```

## Usage

The easiest way to use fsx in your project is to import the `fsx` object:

```js
import { fsx } from "fsx-deno";
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

// delete an empty directory
await fsx.delete("dir");

// delete a non-empty directory
await fsx.deleteAll("dir");
```

If you'd like to create your own instance, import the `DenoFsx` constructor:

```js
import { DenoFsx } from "fsx-deno";

const fsx = new DenoFsx();

// optionally specify the Deno object to use
const volume = {};
const fsx = new DenoFsx({ deno: Deno });
```

If you'd like to use just the impl, import the `DenoFsxImpl` constructor:

```js
import { DenoFsxImpl } from "fsx-deno";

const fsx = new DenoFsxImpl();

// optionally specify the Deno object to use
const volume = {};
const fsx = new DenoFsxImpl({ deno: Deno });
```

## License

Apache 2.0
