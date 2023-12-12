# `fsx/deno`

by [Nicholas C. Zakas](https://humanwhocodes.com)

If you find this useful, please consider supporting my work with a [donation](https://humanwhocodes.com/donate) or [nominate me](https://stars.github.com/nominate/) for a GitHub Star.

## Description

A utility for verifying that environment variables are present in Node.js, Deno, and Bun. The main use case is to easily throw an error when an environment variable is missing. This is most useful immediately after a Node.js or Deno program has been initiated, to fail fast and let you know that environment variables haven't been setup correctly.

## Installation

Set up a `deno.json` file like this:

```json
{
	"imports": {
		"@fsx/deno": "npm:@fsx/deno@latest"
	}
}
```

## Usage

The easiest way to use fsx in your project is to import the `fsx` object:

```js
import { fsx } from "@fsx/deno";
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

If you'd like to create your own instance, import the `DenoFsx` constructor:

```js
import { DenoFsx } from "@fsx/memory";

const fsx = new DenoFsx();

// optionally specify the object to use when storing data
const volume = {};
const fsx = new DenoFsx({ volume });
```

If you'd like to use just the impl, import the `DenoFsxImpl` constructor:

```js
import { DenoFsxImpl } from "@fsx/memory";

const fsx = new DenoFsxImpl();

// optionally specify the object to use when storing data
const volume = {};
const fsx = new DenoFsxImpl({ volume });
```

## License

Apache 2.0
