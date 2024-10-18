# Directory Operations

## Creating Directories

To create a directory, use the `hfs.createDirectory(dirPath)` method, like this:

```js
await hfs.createDirectory("/path/to/directory");
```

> [!TIP]
> This method acts like `mkdir -p`, so it will create all required parent directories if they don't exist.

> [!IMPORTANT]
> This method does not throw an error if the directory already exists.

## Detecting Directories

To determine to if a directory exists, use the `hfs.isDirectory(dirPath)` method, which returns `true` if the given directory exists or `false` otherwise.

```js
if (await hfs.isDirectory("/path/to/directory")) {
	// handle the directory
}
```

> [!IMPORTANT]
> If the directory doesn't exist, `hfs.isDirectory()` returns `false`. This method does not throw errors unless the directorysystem cannot be accessed.

## Copying Directories

To copy a directory and all of its contents, call the `hfs.copyAll(source, destination)` method. For example:

```js
await hfs.copyAll("/path/to/source", "/path/to/destination");
```

## Moving Directories

To move a directory and all of its contents, call the `hfs.moveAll(source, destination)` method. For example:

```js
await hfs.moveAll("/path/to/source", "/path/to/destination");
```

## Deleting Directories

To delete an empty directory, call the `hfs.delete(dirPath)` method. For example:

```js
await hfs.delete("/path/to/directory");
```

This method doesn't throw an error if the path doesn't exist. If you want to know whether or not an existing file was deleted, you can use the return value: `true` if the file was actually deleted or `false` if the file didn't exist:

```js
if (await hfs.delete("/path/to/directory")) {
	console.log("Directory existed and was deleted.");
}
```

To delete a non-empty directory recursively, call the `hfs.deleteAll(dirPath)` method. For example:

```js
await hfs.deleteAll("/path/to/directories");
```

This method also returns a boolean indicating if the directory existed or not.

> [!IMPORTANT]
> The `deleteAll()` method acts like `rm -rf`, so it will delete directories that aren't empty. Use with caution.

## Reading Directory Entries

To read all of the entries in a given directory, use the `hfs.list()` method. This method returns an async iterable and is meant to be used with the `for await-of` statement:

```js
for await (const entry of hfs.list("/path/to/directory")) {
	if (entry.isFile) {
		processFile(entry.name);
	} else if (entry.isDirectory) {
		processDirectory(entry.name)
	}
}
```

Each entry in the async iterator implements the [`HfsDirectoryEntry` interface](../packages/types/src/@humanfs/types.ts).

## Reading Directory Entries Recursively

To recursively read all of the entries in a given directory, use the `hfs.walk()` method. This method returns an async iterable and is meant to be used with the `for await-of` statement:

```js
for await (const entry of hfs.walk("/path/to/directory")) {
	console.log(entry.path);	// path from /path/to/directory

	if (entry.isFile) {
		processFile(entry.name);
	} else if (entry.isDirectory) {
		processDirectory(entry.name)
	}
}
```

Each entry in the async iterator implements the [`HfsWalkEntry` interface](../packages/types/src/@humanfs/types.ts).

You can determine whether or not to walk into a subdirectory by providing the `directoryFilter` option. This function receives the entry and returns `true` to indicate that the subdirectory should be walked or `false` to indicate the subdirectory should be skipped:

```js
// skip the directory named "skip-me"
const directoryFilter = entry => entry.name !== "skip-me";

for await (const entry of hfs.walk("/path/to/directory", { directoryFilter })) {
	console.log(entry.path);	// path from /path/to/directory

	if (entry.isFile) {
		processFile(entry.name);
	} else if (entry.isDirectory) {
		processDirectory(entry.name)
	}
}
```

Similarly, you can determine which entries are emitted from the async iterable by providing an `entryFilter` option. This function also receives the entry and returns `true` to include the entry or `false` to omit it:

```js
// only return files
const entryFilter = entry => entry.isFile;

for await (const entry of hfs.walk("/path/to/directory", { entryFilter })) {
	console.log(entry.path);	// path from /path/to/directory

	if (entry.isFile) {
		processFile(entry.name);
	} else if (entry.isDirectory) {
		processDirectory(entry.name)
	}
}
```

**Note:** Both `directoryFilter` and `entryFilter` may return a promise.

Each entry in the async iterator implements the [`HfsWalkEntry` interface](../packages/types/src/@humanfs/types.ts).

## Retrieving Directory Modification Time

To get the datetime when a directory was last modified, call the `hfs.lastModified(dirPath)` method. This method returns a `Date` object or `undefined` if the directory isn't found. Here's an example:

```js
const mtime = await hfs.lastModified("/path/to/directory");
```
