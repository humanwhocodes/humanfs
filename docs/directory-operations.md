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

## Deleting directories

To delete an empty directory, call the `hfs.delete(dirPath)` method. For example:

```js
await hfs.delete("/path/to/directories");
```

To delete a non-empty directory recursively, call the `hfs.deleteAll(dirPath)` method. For example:

```js
await hfs.deleteAll("/path/to/directories");
```

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
