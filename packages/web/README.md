# `fsx-web`

by [Nicholas C. Zakas](https://humanwhocodes.com)

If you find this useful, please consider supporting my work with a [donation](https://humanwhocodes.com/donate) or [nominate me](https://stars.github.com/nominate/) for a GitHub Star.

## Description

The `fsx` bindings for using web instead of writing to disk.

> [!WARNING]
> This project is **experimental** and may change significantly before v1.0.0. Use at your own caution and definitely not in production!

## Installation

### Node.js

Install using your favorite package manager for Node.js:

```shell
npm install fsx-web

# or

pnpm install fsx-web

# or

yarn add fsx-web

# or

bun install fsx-web
```

Then you can import the `Fsx` class like this:

```js
import { fsx } from "fsx-web";
```

### Deno

For Deno, set up a `deno.json` file like this:

```json
{
	"imports": {
		"fsx-web": "npm:fsx-web@latest"
	}
}
```

Then you can import the `Fsx` class like this:

```js
import { fsx } from "fsx-web";
```

### Browser

It's recommended to import the minified version to save bandwidth:

```js
import { fsx } from "https://cdn.skypack.dev/fsx-web?min";
```

However, you can also import the unminified version for debugging purposes:

```js
import { fsx } from "https://cdn.skypack.dev/fsx-web";
```

## Usage

The easiest way to use fsx in your project is to import the `fsx` object:

```js
import { fsx } from "fsx-web";
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

// delete a non-empty directory
await fsx.deleteAll("dir");
```

If you'd like to create your own instance, import the `webFsx` constructor:

```js
import { webFsx } from "fsx-web";

const fsx = new webFsx();

// optionally specify the object to use when storing data
const volume = {};
const fsx = new webFsx({ volume });
```

If you'd like to use just the impl, import the `webFsxImpl` constructor:

```js
import { webFsxImpl } from "fsx-web";

const fsx = new webFsxImpl();

// optionally specify the object to use when storing data
const volume = {};
const fsx = new webFsxImpl({ volume });
```

## License

Apache 2.0
