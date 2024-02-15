# `@humanfs/deno`

by [Nicholas C. Zakas](https://humanwhocodes.com)

If you find this useful, please consider supporting my work with a [donation](https://humanwhocodes.com/donate) or [nominate me](https://stars.github.com/nominate/) for a GitHub Star.

## Description

The humanfs bindings for use in Node.js and Node.js-compatible runtimes.

> [!WARNING]
> This project is **experimental** and may change significantly before v1.0.0. Use at your own caution and definitely not in production!

## Installation

Set up a `deno.json` file like this:

```json
{
	"imports": {
		"@humanfs/deno": "npm:@humanfs/deno@latest"
	}
}
```

## Usage

The easiest way to use humanfs in your project is to import the `hfs` object:

```js
import { hfs } from "@humanfs/deno";
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

// append text to a file
await hfs.append("file.txt", "Hello world!");

// append bytes to a file
await hfs.append("file.txt", new TextEncoder().encode("Hello world!"));

// does the file exist?
const found = await hfs.isFile("file.txt");

// how big is the file?
const size = await hfs.size("file.txt");

// when was the file modified?
const mtime = await hfs.lastModified("file.txt");

// copy a file from one location to another
await hfs.copy("file.txt", "file-copy.txt");

// move a file from one location to another
await hfs.move("file.txt", "renamed.txt");

// delete a file
await hfs.delete("file.txt");

// 2. Directories

// create a directory
await hfs.createDirectory("dir");

// create a directory recursively
await hfs.createDirectory("dir/subdir");

// does the directory exist?
const dirFound = await hfs.isDirectory("dir");

// copy the entire directory
hfs.copyAll("from-dir", "to-dir");

// move the entire directory
hfs.moveAll("from-dir", "to-dir");

// delete an empty directory
await hfs.delete("dir");

// delete a non-empty directory
await hfs.deleteAll("dir");
```

If you'd like to create your own instance, import the `DenoHfs` constructor:

```js
import { DenoHfs } from "@humanfs/deno";

const hfs = new DenoHfs();

// optionally specify the Deno object to use
const volume = {};
const hfs = new DenoHfs({ deno: Deno });
```

If you'd like to use just the impl, import the `DenoHfsImpl` constructor:

```js
import { DenoHfsImpl } from "@humanfs/deno";

const hfs = new DenoHfsImpl();

// optionally specify the Deno object to use
const volume = {};
const hfs = new DenoHfsImpl({ deno: Deno });
```

## License

Apache 2.0
