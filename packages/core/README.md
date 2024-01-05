# `fsx/core`

by [Nicholas C. Zakas](https://humanwhocodes.com)

If you find this useful, please consider supporting my work with a [donation](https://humanwhocodes.com/donate) or [nominate me](https://stars.github.com/nominate/) for a GitHub Star.

## Description

The core functionality for `fsx` that is shared across all implementations for all runtimes. The contents of this package are intentionally runtime agnostic and are not intended to be used alone.

Currently, this package simply exports the `Fsx` class, which is an abstract base class intended to be inherited from in runtime-specific fsx packages (like `fsx-node`).

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


## License

Apache 2.0
