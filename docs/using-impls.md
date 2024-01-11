# Using Impls

## Introduction

An _impl_ contains the implementation for an fsx runtime package. All of the filesystem calls are contained within an impl, and then that impl is wrapped by the `Fsx` class to create an `fsx` singleton for the runtime package.

This separation of concerns, where the impl handles all the filesystem operations and the `Fsx` class handles everything else, allows you to swap impls at runtime. This ability makes fsx easy to test, as you can swap out the actual operations without needing to mock out entire JavaScript modules.

## The Basics

Each `fsx` instance is created with a _base impl_ that defines how the `fsx` object should behave in production. The _active impl_ is the impl in use at any given time, which may or may not be the base impl. You can change the active impl by calling `fsx.setImpl()`. For example:

```js
import { fsx } from "fsx-node";

fsx.setImpl({
	json() {
		throw Error("This operation is not supported");
	},
});

// somewhere else

await fsx.json("/path/to/file.json"); // throws error
```

In this example, the base impl is swapped out for a custom one that throws an error when the `fsx.json()` method is called.

> [!TIP]
> All of the methods on an impl are optional, so you only ever need to implement the methods you plan on using. If you call a method that isn't present on the impl, an error is thrown.

The `fsx.isBaseImpl()` method lets you know if the base impl is the active impl:

```js
import { fsx } from "fsx-node";

console.log(fsx.isBaseImpl()); // true

fsx.setImpl({});

console.log(fsx.isBaseImpl()); // false
```

After you've changed the active impl, you can swap back to the base impl by calling `fsx.resetImpl()`:

```js
import { fsx } from "fsx-node";

console.log(fsx.isBaseImpl()); // true

fsx.setImpl({});

console.log(fsx.isBaseImpl()); // false

fsx.resetImpl();

console.log(fsx.isBaseImpl()); // true
```

> [!IMPORTANT]
> You can only call `fsx.setImpl()` one time. If you call it a second time without calling `fsx.resetImpl()` first, then an error is thrown. This is to ensure that the active impl is always known as either the one you just passed using `fsx.setImpl()` or the base impl -- this restriction ensures that the impl is never swapped out more than once, making it difficult to track the intended behavior.

## Swapping Impls in Practice

The design of fsx is such that it makes testing filesystem operations easy, both through [logging](./logging.md) and through impl swapping. For example, you might use the `fsx` object throughout your application to perform filesystem operations and then need to test those operations elsewhere. You don't want to go through the trouble of mocking an entire package, so you can swap the impl in your tests.

Consider the following function:

```js
import path from "node:path";
import { fsx } from "fsx-node";

const CONFIG_FILE_PATH = path.join(process.cwd(), "my.config.json");

async function readConfigFile() {
	return fsx.json(CONFIG_FILE_PATH);
}
```

This function reads JSON data from a config file in a known location. During testing, you don't want to actually have a file on disk to read because maybe you don't want to store that file in the current working directory. You can swap out the base impl for one that just implements the `fsx.json()` method to test your functionality, like this:

```js
import path from "node:path";
import { fsx } from "fsx-node";
import assert from "node:assert";
import { readConfigFile } from "../src/example.js";

describe("readConfigFile()", () => {
	afterEach(() => {
		fsx.resetImpl();
	});

	it("should read data from config file", async () => {
		fsx.setImpl({
			json(filePath) {
				{
					assert.strictEquals(
						filePath,
						path.join(process.cwd(), "my.config.json"),
					);
					return {
						success: true,
					};
				}
			},
		});

		const config = await readConfigFile();

		assert.deepStrictEquals(config, {
			success: true,
		});
	});
});
```

Here, the test sets an impl that stubs out the `fsx.json()` method. Because the `readConfigFile()` method is also using the `fsx` singleton, its behavior changes at runtime to use the new impl without any further changes. The `afterEach()` function resets the impl after each test to ensure that each test starts from scratch.

Maybe you don't want to hit the actual filesystem for this test. Instead, you can swap out the impl of `fsx` and replace it with an in-memory filesystem implementation provided by `fsx-memory`, like this:

```js
import { fsx } from "fsx-node";
import { MemoryFsxImpl } from "fsx-memory";
import { readConfigFile } from "../src/example.js";
import assert from "node:assert";

describe("readConfigFile()", () => {

    beforeEach(() => {
        fsx.setImpl(new MemoryFsxImpl());
    });

    afterEach(() => {
        fsx.resetImpl();
    });

    it("should read config file", async () => {

        await fsx.write("config.json", JSON.stringify({ found: true });

        const result = await readConfigFile();

        assert.isTrue(result.found);
    });

});
```

In this example, the `fsx` singleton begins as an abstraction on top of the Node.js `fs` module but then the impl is swapped out right before each test starts. Switching to an in-memory impl means faster tests without messing up the working directory.
