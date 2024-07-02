# `@humanfs/box`

by [Nicholas C. Zakas](https://humanwhocodes.com)

If you find this useful, please consider supporting my work with a [donation](https://humanwhocodes.com/donate) or [nominate me](https://stars.github.com/nominate/) for a GitHub Star.

## Description

The humanfs bindings for using the Box API instead of writing to disk.

> [!WARNING]
> This project is **experimental** and may change significantly before v1.0.0. Use at your own caution and definitely not in production!

## Installation

### Node.js

Install using your favorite package manager for Node.js:

```shell
npm install @humanfs/box

# or

pnpm install @humanfs/box

# or

yarn add @humanfs/box

# or

bun install @humanfs/box
```

Then you can import the `Hfs` class like this:

```js
import { BoxHfs } from "@humanfs/box";
```

### Deno

Install using Deno:

```shell
deno add @humanfs/box
```

Then you can import the `Hfs` class like this:

```js
import { BoxHfs } from "@humanfs/box";
```

### Browser

It's recommended to import the minified version to save bandwidth:

```js
import { BoxHfs } from "https://cdn.skypack.dev/@humanfs/box?min";
```

However, you can also import the unminified version for debugging purposes:

```js
import { BoxHfs } from "https://cdn.skypack.dev/@humanfs/box";
```

## Usage

The easiest way to use humanfs in your project is to import the `hfs` object:

```js
import { BoxHfs } from "@humanfs/box";
```

Then, you can use the API methods:

```js
// create a new instance and assign your access token
const hfs = new BoxHfs({ token: process.env.BOX_TOKEN });

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

// delete a directory
await hfs.delete("dir");

// delete a non-empty directory
await hfs.deleteAll("dir");
```

## License

Apache 2.0
