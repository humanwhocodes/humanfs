# `@humanfs/memory`

by [Nicholas C. Zakas](https://humanwhocodes.com)

If you find this useful, please consider supporting my work with a [donation](https://humanwhocodes.com/donate) or [nominate me](https://stars.github.com/nominate/) for a GitHub Star.

## Description

The humanfs bindings for using memory instead of writing to disk.

> [!WARNING]
> This project is **experimental** and may change significantly before v1.0.0. Use at your own caution and definitely not in production!

## Installation

### Node.js

Install using your favorite package manager for Node.js:

```shell
npm install @humanfs/memory

# or

pnpm install @humanfs/memory

# or

yarn add @humanfs/memory

# or

bun install @humanfs/memory
```

Then you can import the `Hfs` class like this:

```js
import { hfs } from "@humanfs/memory";
```

### Deno

For Deno, set up a `deno.json` file like this:

```json
{
	"imports": {
		"@humanfs/memory": "npm:@humanfs/memory@latest"
	}
}
```

Then you can import the `Hfs` class like this:

```js
import { hfs } from "@humanfs/memory";
```

### Browser

It's recommended to import the minified version to save bandwidth:

```js
import { hfs } from "https://cdn.skypack.dev/@humanfs/memory?min";
```

However, you can also import the unminified version for debugging purposes:

```js
import { hfs } from "https://cdn.skypack.dev/@humanfs/memory";
```

## Usage

The easiest way to use humanfs in your project is to import the `hfs` object:

```js
import { hfs } from "@humanfs/memory";
```

Then, you can use the API methods:

```js
// 1. Files

// read from a text file
const text = await hfs.text("file.txt");

// read from a JSON file
const json = await hfs.json("file.json");

// read raw bytes from a text file
const arrayBuffer = await hfs.arrayBuffer("file.txt");

// write text to a file
await hfs.write("file.txt", "Hello world!");

// write bytes to a file
await hfs.write("file.txt", new TextEncoder().encode("Hello world!"));

// does the file exist?
const found = await hfs.isFile("file.txt");

// how big is the file?
const size = await hfs.size("file.txt");

// delete a file
await hfs.delete("file.txt");

// 2. Directories

// create a directory
await hfs.createDirectory("dir");

// create a directory recursively
await hfs.createDirectory("dir/subdir");

// does the directory exist?
const dirFound = await hfs.isDirectory("dir");

// delete a directory
await hfs.delete("dir");

// delete a non-empty directory
await hfs.deleteAll("dir");
```

If you'd like to create your own instance, import the `MemoryHfs` constructor:

```js
import { MemoryHfs } from "@humanfs/memory";

const hfs = new MemoryHfs();

// optionally specify the object to use when storing data
const volume = {};
const hfs = new MemoryHfs({ volume });
```

If you'd like to use just the impl, import the `MemoryHfsImpl` constructor:

```js
import { MemoryHfsImpl } from "@humanfs/memory";

const hfs = new MemoryHfsImpl();

// optionally specify the object to use when storing data
const volume = {};
const hfs = new MemoryHfsImpl({ volume });
```

## License

Apache 2.0
