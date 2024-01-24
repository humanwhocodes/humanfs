# `fsx-core`

by [Nicholas C. Zakas](https://humanwhocodes.com)

If you find this useful, please consider supporting my work with a [donation](https://humanwhocodes.com/donate) or [nominate me](https://stars.github.com/nominate/) for a GitHub Star.

## Description

The core functionality for `fsx` that is shared across all implementations for all runtimes. The contents of this package are intentionally runtime agnostic and are not intended to be used alone.

Currently, this package simply exports the `Fsx` class, which is an abstract base class intended to be inherited from in runtime-specific fsx packages (like `fsx-node`).

> [!WARNING]
> This project is **experimental** and may change significantly before v1.0.0. Use at your own caution and definitely not in production!

## Installation

### Node.js

Install using your favorite package manager for Node.js:

```shell
npm install fsx-core

# or

pnpm install fsx-core

# or

yarn add fsx-core

# or

bun install fsx-core
```

Then you can import the `Fsx` class like this:

```js
import { Fsx } from "fsx-core";
```

### Deno

For Deno, set up a `deno.json` file like this:

```json
{
	"imports": {
		"fsx-core": "npm:fsx-core@latest"
	}
}
```

Then you can import the `Fsx` class like this:

```js
import { Fsx } from "fsx-core";
```

### Browser

It's recommended to import the minified version to save bandwidth:

```js
import { Fsx } from "https://cdn.skypack.dev/fsx-core?min";
```

However, you can also import the unminified version for debugging purposes:

```js
import { Fsx } from "https://cdn.skypack.dev/fsx-core";
```

## Usage

The `Fsx` class contains all of the basic functionality for an `Fsx` instance *without* a predefined impl. This class is mostly used for creating runtime-specific impls, such as `NodeFsx` and `DenoFsx`.

You can create your own instance by providing an `impl` directly:

```js
const fsx = new Fsx({ impl: { async text() {} }});
```

The specified `impl` becomes the base impl for the instance, meaning you can always reset back to it using `resetImpl()`.

You can also inherit from `Fsx` to create your own class with a preconfigured impl, such as:

```js
class MyFsx extends Fsx {
	constructor() {
		super({
			impl: myImpl
		});
	}
}
```

## License

Apache 2.0
