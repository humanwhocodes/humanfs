# `@humanfs/core`

by [Nicholas C. Zakas](https://humanwhocodes.com)

If you find this useful, please consider supporting my work with a [donation](https://humanwhocodes.com/donate) or [nominate me](https://stars.github.com/nominate/) for a GitHub Star.

## Description

The core functionality for `hfs` that is shared across all implementations for all runtimes. The contents of this package are intentionally runtime agnostic and are not intended to be used alone.

Currently, this package simply exports the `Hfs` class, which is an abstract base class intended to be inherited from in runtime-specific hfs packages (like `@humanfs/node`).

> [!WARNING]
> This project is **experimental** and may change significantly before v1.0.0. Use at your own caution and definitely not in production!

## Installation

### Node.js

Install using your favorite package manager for Node.js:

```shell
npm install @humanfs/core

# or

pnpm install @humanfs/core

# or

yarn add @humanfs/core

# or

bun install @humanfs/core
```

Then you can import the `Hfs` class like this:

```js
import { Hfs } from "@humanfs/core";
```

### Deno

For Deno, set up a `deno.json` file like this:

```json
{
	"imports": {
		"@humanfs/core": "npm:@humanfs/core@latest"
	}
}
```

Then you can import the `Hfs` class like this:

```js
import { Hfs } from "@humanfs/core";
```

### Browser

It's recommended to import the minified version to save bandwidth:

```js
import { Hfs } from "https://cdn.skypack.dev/@humanfs/core?min";
```

However, you can also import the unminified version for debugging purposes:

```js
import { Hfs } from "https://cdn.skypack.dev/@humanfs/core";
```

## Usage

The `Hfs` class contains all of the basic functionality for an `Hfs` instance *without* a predefined impl. This class is mostly used for creating runtime-specific impls, such as `NodeHfs` and `DenoHfs`.

You can create your own instance by providing an `impl` directly:

```js
const hfs = new Hfs({ impl: { async text() {} }});
```

The specified `impl` becomes the base impl for the instance, meaning you can always reset back to it using `resetImpl()`.

You can also inherit from `Hfs` to create your own class with a preconfigured impl, such as:

```js
class MyHfs extends Hfs {
	constructor() {
		super({
			impl: myImpl
		});
	}
}
```

## License

Apache 2.0
