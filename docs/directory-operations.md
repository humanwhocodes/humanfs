#  Operations

## Creating Directories

To create a directory, use the `fsx.createDirectory(dirPath)` method, like this:

```js
await fsx.createDirectory("/path/to/directory");
```

> [!TIP]
> This method acts like `mkdir -p`, so it will create all required parent directories if they don't exist.

> [!IMPORTANT]
> This method does not throw an error if the directory already exists.

## Detecting Directories

To determine to if a directory exists, use the `fsx.isDirectory(dirPath)` method, which returns `true` if the given directory exists or `false` otherwise.

```js
if (await fsx.isdirectory("/path/to/directory")) {
    // handle the directory
}
```

> [!IMPORTANT]
> If the directory doesn't exist, `fsx.isDirectory()` returns `false`. This method does not throw errors unless the directorysystem cannot be accessed.

## Deleting directories

To delete directories, call the `fsx.delete(dirPath)` method. For example:

```js
await fsx.delete("/path/to/directories");
```

> [!IMPORTANT]
> This method acts like `rm -rf`, so it will delete directories that aren't empty.
