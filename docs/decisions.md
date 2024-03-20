# 2024-03-19 `delete()` and `deleteAll()` should not throw errors on missing items

## Background

Most of the runtime APIs for files throw an error when you attempt to delete a file that doesn't exist (an `ENOENT` error).

## Decision

The `delete()` and `deleteAll()` methods should not throw an error when the specified path doesn't exist. They should return `false` in that case, or `true` if the path did exist and wasn't deleted.

## Rationale

In most cases, humanfs suppresses `ENOENT` errors but didn't with `delete()` and `deleteAll()`. Logically, you typically only care that the specified path no longer exists, not whether it actually existed in the first place. If you actually care about that, then checking the return value of `delete()` and `deleteAll()` is a nicer way to handle it.

## Related

* https://github.com/humanwhocodes/humanfs/discussions/104

# 2024-02-22 Impls only need to implement `write()` and `append()` to accept `Uint8Array`.

## Background

Originally, impls needed to implement `write()` and `append()` to accept strings, `ArrayBuffer`s, and `ArrayBuffer` views.

## Decision

Impls need only implement `write()` and `append()` to accept `Uint8Array`; `Hfs` will ensure that any data that is passed to `write()` or `append()` is converted to a `Uint8Array` before passing the data to the impl.

## Rationale

Similar to the previous decision regarding `bytes()`, implementing `write()` and `append()` across impls revealed a lot of code duplication to validate and transform the input. The validation and transformation logic can more centrally be done in the `Hfs` class, making impl implementation simpler.

# 2024-02-22 Impls only need to implement `bytes()` to read files

## Background

Originally, impls needed to implement `text()`, `json()`, `arrayBuffer()`, and `bytes()` to support all ways of reading a file.

## Decision

Impls need only implement `bytes()`; the `text()`, `json()`, and `arrayBuffer()` methods will exist only on `Hfs` and will use `bytes()` from the impl.

## Rationale

In implementing multiple different impls, it became clear that there was a lot of unnecessarily duplication of functionality. For instance, `json()` is just `text()` passed through `JSON.parse()`, so that could be moved to the `Hfs` class. Further `arrayBuffer()` is just `bytes()` and then accessing the `buffer` property, and even further, `text()` can be implemented with `bytes()` and `TextDecoder`. Impls should not need to share code from other impls, and so refocusing on `bytes()` as the primary impl read method reduces development time and the amount of code necessary to create an impl.

# 2024-02-14 The `lastModified()` method should return a `Date`

## Background

Node.js returns mtimes as both milliseconds and `Date` objects. Deno returns mtimes as `Date` objects. The origin private file system returns mtimes as milliseconds.

## Decision

The `lastModified()` method will return a `Date` object.

## Rationale

When considering developer ergonomics, it seems that returning a `Date` object would be the expected common case for this method. For people who want the milliseconds, they can call `result.getTime()` or even `+result` vs. forcing people to write `new Date(result)` if a number was returned. Once again, I think Deno got this correct.

# 2024-02-10 The `move()` method should work only on files

## Background

File system APIs typically have a single method (usually `rename()`) that moves both files and directories.

## Decision

The `move()` method will only work on files. The `moveAll()` method will work on files and directories.

## Rationale

We already have `copy()` for copying just files (and empty directories) and `copyAll()` that recursively copies directories, making it obvious that you could be operating on a directory and that operation is potentially more impactful. Even though moving a directory is not destructive, `move()` has the same perils as `copy()` in that it might not be obvious if you mistakenly passed in a directory instead of a file. Further, in some cases `moveAll()` may need to fall back to calling `copyAll()` and `deleteAll()`, so it should have the same name indicating the same significance of the operation.

## Related

* https://github.com/humanwhocodes/humanfs/issues/20

# 2024-02-05 The `move()` method instead of the `rename()` method

## Background

When implementing a method that changes the location of a file or directory, both Node.js and Deno use the method name `rename()`. Another option would be `move()`.

## Decision

The method will be named `move()`.

## Rationale

The word "rename" is unclear in what it accomplishes. It could just be renaming a file in-place without being able to move the file to a different directory. Both Node.js and Deno will actually move the file if necessary, and the name "move" more clearly indicates that this is a possibility.

## Related

* https://github.com/humanwhocodes/humanfs/issues/20

# 2024-01-22 The `delete()` method should only delete files and empty directories

## Background

Originally, the `delete()` method would delete either files or directories, whether empty or not, depending on the path it was passed.

## Decision

The `delete()` method should only delete files and empty directories. A new method, `deleteAll()`, should be created to delete directories.

## Rationale

While convenient to have just one method to delete both files and directories, it also introduces the possibility that someone could *think* they are deleting a file but actually be deleting a full directory. Deleting a full directory recursively is a much more destructive action than deleting a file, so it makes sense to protect against that case. By splitting `deleteAll()` off from `delete()`, the code now makes it obvious that you are choosing the more destructive option explicitly. This also mimics the Deno functionality where `remove(path)` can be used to delete files and empty directories while `remove(path, {recursive:true})` deletes files and recursively deletes directories.

## Related

* https://github.com/humanwhocodes/humanfs/discussions/22

# 2024-01-18 The `list()` method should return an async iterable

## Background

Different runtimes have different interfaces for reading entries in a directory: Node.js returns `Promise<Array<string>>` by default while Deno returns `AsyncIterable<DirEnt>`.

## Decision

The `list()` method should return an `AsyncIterable<DirEnt>`.

## Rationale

Node.js' interface really only works with normal file system where everything about it is known ahead of time. For where this project wants to go, implementing impls for cloud drives, it's just not practical to return all of the entries in a directory at once. It's clear that Deno's interface allows for the possibility of returning batches of results and only fetching further results when needed, which is exactly what this project needs for cloud drives.

## Related

* https://github.com/humanwhocodes/humanfs/issues/10

# 2024-01-18 `arrayBuffer()` should be replaced by `bytes()`

## Background

The `arrayBuffer()` method was added to match with the methods available on the `Response` object (via `fetch()`), but it seems like most APIs now expect `Unit8Array` objects.

## Decision

A new `bytes()` method that returns a `Uint8Array` replaces the `arrayBuffer()` method. The `arrayBuffer()` method is deprecated and will be removed in a future version.

## Rationale

APIs typically don't work on raw `ArrayBuffer` objects (such as `TextEncoder`), and on most runtimes, the underlying filesystem APIs don't return `ArrayBuffer` objects (Node.js returns `Buffer` and Deno returns `Uint8Array`), requiring an extra step to extract the `ArrayBuffer`, which the end user will likely just wrap in a `Uint8Array` anyway. By providing a `bytes()` method, users will get the data structure they need immediately and will still have access to an `ArrayBuffer` as necessary using the `.buffer` property.

## Related

* https://github.com/humanwhocodes/humanfs/discussions/12

# 2024-01-02 `createDirectory()` should not return a boolean

## Background

In the initial implementation of `createDirectory()`, there was no way to tell if a directory was created or already existed because it always returned `undefined`. This information may be useful to developers.

## Decision

The `createDirectory()` method will continue to return `undefined` in all cases.

## Rationale

Because `createDirectory()` always works with `{ recursive: true }` in the underlying filesystem calls, it doesn't know whether or not the directory already exists. Node.js and Deno methods for creating directories don't throw errors for existing directories when using `recursive: true` as an option, meaning it would take a second filesystem call to return the correct value. Given that the behavior of `{ recursive: true }` is consistent across runtimes, it doesn't make sense for `createDirectory()` to go out of its way to give additional information that isn't provided by the runtimes automatically.

# 2023-12-13 `Hfs` should handle validating parameters

## Background

In the beginning, it was up to each impl to validate the input it was passed and throw an appropriate error.

## Decision

The `Hfs` class should handle parameter validation for all of its methods.

## Rationale

Asking impl implementors to all implement the same input validation is a waste of everyone's time. Because an impl is designed to be used inside of `Hfs`, I can lighten implementor burden by handling parameter validation centrally and remove that from the requirements for writing an impl.

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
const result = await hfs.text("file.txt");

// write
await hfs.text("file.txt", "Hello world!");
```

## Decision

There will be separate methods to read and write.

## Rationale

While there is an argument for end-user convenience, having the same method behave differently depending on the arguments that are passed is error-prone both for end-users and developers. Developers, in particular, will need to be sure they are always checking the number of arguments in their custom `impl` objects, and as such, it will be easy to create bugs because this side effect may not be obvious. None of these hazards exist when there are separate methods for the different functionality.

# 2023-11-17 Impl can only be set once

## Background

While the `impl` concept is powerful, allowing users to override the `impl` without editing the code it affects, it does come with a price: it's not always clear whether an `Hfs` instance is using the base `impl` or an overridden one. The `isBaseImpl()` method provides a way to determine this programmatically, but that requires users to call it before proceeding.

## Decision

`setImpl()` can only be called once until `resetImpl()` is called. Once `resetImpl()` is called, `setImpl()` may be called again.

## Rationale

The worst case scenario is if somewhere in the code calls `setImpl()` and then later on, in some other section of code, `setImpl()` is called again with a different value. This is really confusing as it's never clear which `impl` should be used at any given point in the code. By limiting when `setImpl()` is called, that means the `Hfs` class is guaranteed to either be using the base `impl` or the one passed to `setImpl()`, which dramatically reduces the likelihood of unexpected behavior, especially in a codebase where multiple people might be participating.

This is the problem scenario. Consider that you have a test where you want to mock out `hfs` to verify some method gets called:

```js
hfs.setImpl(mockImpl);
hfs.logStart("test");

/*
 * The expectation is that this function now uses `hfs` with `fooImpl`,
 * but how do we know that this function doesn't also call `setImpl()`?
 * By throwing an error when `setImpl()` is called again, we know for sure.
 */
someFunctionThatUsesHfs();

validateLogs(hfs.logEnd("test"));

hfs.resetImpl();
```
