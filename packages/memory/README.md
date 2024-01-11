# `fsx-memory`

by [Nicholas C. Zakas](https://humanwhocodes.com)

If you find this useful, please consider supporting my work with a [donation](https://humanwhocodes.com/donate) or [nominate me](https://stars.github.com/nominate/) for a GitHub Star.

## Description

The `fsx` bindings for using memory instead of writing to disk.

> [!WARNING]
> This project is **experimental** and may change significantly before v1.0.0. Use at your own caution and definitely not in production!


## Installation

### Node.js

Install using your favorite package manager for Node.js:

```shell
npm install fsx-memory

# or

pnpm install fsx-memory

# or

yarn add fsx-memory

# or

bun install fsx-memory
```

Then you can import the `Fsx` class like this:

```js
import { fsx } from "fsx-memory";
```

### Deno

For Deno, set up a `deno.json` file like this:

```json
{
	"imports": {
		"fsx-memory": "npm:fsx-memory@latest"
	}
}
```

Then you can import the `Fsx` class like this:

```js
import { fsx } from "fsx-memory";

```

### Browser

It's recommended to import the minified version to save bandwidth:

```js
import { fsx } from "https://cdn.skypack.dev/fsx-memory?min";
```

However, you can also import the unminified version for debugging purposes:

```js
import { fsx } from "https://cdn.skypack.dev/fsx-memory";
```

## Usage

The easiest way to use fsx in your project is to import the `fsx` object:

```js
import { fsx } from "fsx-memory";
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

If you'd like to create your own instance, import the `MemoryFsx` constructor:

```js
import { MemoryFsx } from "fsx-memory";

const fsx = new MemoryFsx();

// optionally specify the object to use when storing data
const volume = {};
const fsx = new MemoryFsx({ volume });
```

If you'd like to use just the impl, import the `MemoryFsxImpl` constructor:

```js
import { MemoryFsxImpl } from "fsx-memory";

const fsx = new MemoryFsxImpl();

// optionally specify the object to use when storing data
const volume = {};
const fsx = new MemoryFsxImpl({ volume });
```

## License

Apache 2.0
