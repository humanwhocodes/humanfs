# fsx: A modern filesystem API for JavaScript

by [Nicholas C. Zakas](https://humanwhocodes.com)

If you find this useful, please consider supporting my work with a [donation](https://humanwhocodes.com/donate) or [nominate me](https://stars.github.com/nominate/) for a GitHub Star.

## Description

This is the monorepo for fsx, a modern filesystem API for JavaScript. Most of the filesystem APIs provided by JavaScript runtimes were designed to emulate Linux utilities which, while making them easy to adopt and understand, often requires writing way more code than necessary for common tasks. fsx is a new approach that streamlines the most common operations while providing useful ways to test the expected functionality.

## Dev Environment Setup

### Prerequisites

You must have the following installed:

1. [Node.js](https://nodejs.org)
1. [Deno](https://deno.land)

Then follow these steps:

1. Fork the repository
2. Clone your fork
3. Run `npm install` to set up dependencies

> [!NOTE]
> It's recommended to use the Visual Studio Code [Deno extension](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno) for the best developer experience. When you first open the project in Visual Studio Code, you'll be prompted to install this extension.

### Testing

To test everything:

```shell
npm test
```

To test just one workspace

```shell
npm test -w packages/node
```

### Linting

To lint everything:

```shell
npm run lint
```

To lint and fix everything:

```shell
npm run lint:fix
```

### Formatting

To format all files:

```shell
npm run fmt
```

## License

Apache 2.0
