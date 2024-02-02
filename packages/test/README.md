# `@humanfs/test`

by [Nicholas C. Zakas](https://humanwhocodes.com)

If you find this useful, please consider supporting my work with a [donation](https://humanwhocodes.com/donate) or [nominate me](https://stars.github.com/nominate/) for a GitHub Star.

## Description

Testing utilities for humanfs.

> [!WARNING]
> This project is **experimental** and may change significantly before v1.0.0. Use at your own caution and definitely not in production!

## Installation

### Node.js

Install using your favorite package manager for Node.js:

```shell
npm install @humanfs/test

# or

pnpm install @humanfs/test

# or

yarn add @humanfs/test

# or

bun install @humanfs/test
```

Then you can import the `Hfs` and `Path` classes like this:

```js
import { HfsImplTester } from "@humanfs/test";
```

### Deno

For Deno, set up a `deno.json` file like this:

```json
{
	"imports": {
		"@humanfs/test": "npm:@humanfs/test@latest"
	}
}
```

Then you can import the `Hfs` class like this:

```js
import { HfsImplTester } from "@humanfs/test";
```

### Browser

It's recommended to import the minified version to save bandwidth:

```js
import { HfsImplTester } from "https://cdn.skypack.dev/@humanfs/test?min";
```

However, you can also import the unminified version for debugging purposes:

```js
import { HfsImplTester } from "https://cdn.skypack.dev/@humanfs/test";
```

## Usage

### Prerequisites

At a minimum, an impl must implement these methods to use `HfsImplTester`:

* `createDirectory()`
* `deleteAll()`
* `isDirectory()`
* `isFile()`
* `text()`
* `write()`

### The `HfsImplTester` Class

The `HfsImplTester` class contains built-in testing for impls to ensure that they comply with the `HfsImpl` interface. This class is testrunner agnostic, and you must provide a directory to work in, the equivalent of `describe` and `it`, and an assertion library, in order for it work correctly. Here's an example for Node.js:

```js
// Node.js
import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import path from "node:path";

const tester = new HfsImplTester({
	outputDir: path.resolve(process.cwd(), ".hfs-tests"),
	assert,
	test: {
        describe,
        it,
        beforeEach,
        afterEach
    }
});
```

For Deno, you'll need to import the relevant modules and assign them to match the Node.js APIs, such as:

```js
import {
	describe,
	it,
	beforeEach,
	afterEach,
} from "https://deno.land/std/testing/bdd.ts";
import {
	assert,
	assertEquals,
	assertObjectMatch,
	assertRejects,
} from "https://deno.land/std/assert/mod.ts";
import * as path from "https://deno.land/std/path/mod.ts";

const tester = new HfsImplTester({
	outputDir: path.resolve(Deno.cwd(), ".hfs-tests"),
	assert: {
		strictEqual: assertEquals,
		deepStrictEqual: assertObjectMatch,
		rejects: assertRejects,
		ok: assert,
	},
	test: {
		describe,
		it,
		beforeEach,
		afterEach,
	},
});
```

Once set up, you can run the tests like this:

```js
await tester.test({
	name: "Name to show up in test output",
	impl: new MyImpl()
});
```

The `HfsImplTester` will only run tests for the minimum required methods plus any additional interface methods found.

## License

Apache 2.0
