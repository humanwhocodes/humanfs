# 2024-01-18 `arrayBuffer()` should be replaced by `bytes()`

## Background

The `arrayBuffer()` method was added to match with the methods available on the `Response` object (via `fetch()`), but it seems like most APIs now expect `Unit8Array` objects.

## Decision

A new `bytes()` method that returns a `Uint8Array` replaces the `arrayBuffer()` method. The `arrayBuffer()` method is deprecated and will be removed in a future version.

## Rationale

APIs typically don't work on raw `ArrayBuffer` objects (such as `TextEncoder`), and on most runtimes, the underlying filesystem APIs don't return `ArrayBuffer` objects (Node.js returns `Buffer` and Deno returns `Uint8Array`), requiring an extra step to extract the `ArrayBuffer`, which the end user will likely just wrap in a `Uint8Array` anyway. By providing a `bytes()` method, users will get the data structure they need immediately and will still have access to an `ArrayBuffer` as necessary using the `.buffer` property.

## Related

* https://github.com/humanwhocodes/fsx/discussions/12

# 2024-01-02 `createDirectory()` should not return a boolean

## Background

In the initial implementation of `createDirectory()`, there was no way to tell if a directory was created or already existed because it always returned `undefined`. This information may be useful to developers.

## Decision

The `createDirectory()` method will continue to return `undefined` in all cases.

## Rationale

Because `createDirectory()` always works with `{ recursive: true }` in the underlying filesystem calls, it doesn't know whether or not the directory already exists. Node.js and Deno methods for creating directories don't throw errors for existing directories when using `recursive: true` as an option, meaning it would take a second filesystem call to return the correct value. Given that the behavior of `{ recursive: true }` is consistent across runtimes, it doesn't make sense for `createDirectory()` to go out of its way to give additional information that isn't provided by the runtimes automatically.

# 2023-12-13 `Fsx` should handle validating parameters

## Background

In the beginning, it was up to each impl to validate the input it was passed and throw an appropriate error.

## Decision

The `Fsx` class should handle parameter validation for all of its methods.

## Rationale

Asking impl implementors to all implement the same input validation is a waste of everyone's time. Because an impl is designed to be used inside of `Fsx`, I can lighten implementor burden by handling parameter validation centrally and remove that from the requirements for writing an impl.

# 2023-12-07 The `text()`, `json()`, and `arrayBuffer()` methods will not throw on a missing file

## Background

Filesystem APIs typically throw an error when you try to read a file that doesn't exist. This is true in Node.js and Deno.

## Decision

The `text()`, `json()`, and `arrayBuffer()` methods will return `undefined` when the file doesn't exist instead of throwing an error.

## Rationale

Needing to wrap every file read in a `try-catch` or with a rejection handler is a lot of boilerplate that shouldn't be needed. In many cases, programs check the result of a read operation before continuing, so it should be easy to check that the value isn't `undefined`.

# 2023-12-06 The `write()` method will create nonexistent directories

## Background

Filesystem APIs generally require you to create a directory before you can write a file in it, so if you want to write to `/foo/bar.txt` then the directory `/foo` needs to exist first. Attempting to write to `/foo/bar.txt` if `/foo` doesn't exist will throw an error in Node.js and Deno.

## Decision

The `write()` method will create directories when they don't exist.

## Rationale

Needing to constantly check if a directory exists is a pain. In most cases, you want the file to be written and expect the directory to be there. So just like `createDirectory()` automatically creates the entire path, `write()` should automatically create the entire path so the file can be written. This will prevent extra error handling by requiring a `try-catch` or a promise rejection handler.

# 2023-11-21 The `write()` method will not write JSON

## Background

There is only one `write()` method, accepting a filename and some data. Passing in a string or an `ArrayBuffer` as data is pretty straight forward. However, passing in a value to be JSON serialized is tricky because it can technically be any string, number, null, array, or object.

## Decision

The `write()` method will only accept a string or `ArrayBuffer` as data.

## Rationale

Detecting whether or not to JSON serialize a value passed into `write()` is error prone and could result in unexpected bugs that are difficult to track down. Additionally, the `write()` method shouldn't be transforming the data it receives; it should be writing exactly what it receives and leave any transforming to the end-user.

# 2023-11-20 Read/write methods will not be overloaded

## Background

In an effort to streamline the API, I considered using an old pattern from jQuery where the same method can be used both to read and write. For example, maybe the `text()` method could be used to both read and write files depending on the arguments:

```js
// read
const result = await fsx.text("file.txt");

// write
await fsx.text("file.txt", "Hello world!");
```

## Decision

There will be separate methods to read and write.

## Rationale

While there is an argument for end-user convenience, having the same method behave differently depending on the arguments that are passed is error-prone both for end-users and developers. Developers, in particular, will need to be sure they are always checking the number of arguments in their custom `impl` objects, and as such, it will be easy to create bugs because this side effect may not be obvious. None of these hazards exist when there are separate methods for the different functionality.

# 2023-11-17 Impl can only be set once

## Background

While the `impl` concept is powerful, allowing users to override the `impl` without editing the code it affects, it does come with a price: it's not always clear whether an `Fsx` instance is using the base `impl` or an overridden one. The `isBaseImpl()` method provides a way to determine this programmatically, but that requires users to call it before proceeding.

## Decision

`setImpl()` can only be called once until `resetImpl()` is called. Once `resetImpl()` is called, `setImpl()` may be called again.

## Rationale

The worst case scenario is if somewhere in the code calls `setImpl()` and then later on, in some other section of code, `setImpl()` is called again with a different value. This is really confusing as it's never clear which `impl` should be used at any given point in the code. By limiting when `setImpl()` is called, that means the `Fsx` class is guaranteed to either be using the base `impl` or the one passed to `setImpl()`, which dramatically reduces the likelihood of unexpected behavior, especially in a codebase where multiple people might be participating.

This is the problem scenario. Consider that you have a test where you want to mock out `fsx` to verify some method gets called:

```js
fsx.setImpl(mockImpl);
fsx.logStart("test");

/*
 * The expectation is that this function now uses `fsx` with `fooImpl`,
 * but how do we know that this function doesn't also call `setImpl()`?
 * By throwing an error when `setImpl()` is called again, we know for sure.
 */
someFunctionThatUsesFsx();

validateLogs(fsx.logEnd("test"));

fsx.resetImpl();
```
