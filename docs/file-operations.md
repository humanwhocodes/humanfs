# File Operations

## Reading Files

Files are read by using the method that returns the specific data type that you want:

-   `hfs.text(filePath)` reads the given file and returns a string.
-   `hfs.json(filePath)` reads the given file and returns a JSON value.
-   `hfs.bytes(filePath)` reads the given file and returns an `Uint8Array`.
-   **Deprecated:** `hfs.arrayBuffer(filePath)` reads the given file and returns an `ArrayBuffer`.

Here are some examples:

```js
// read plain text
const text = await hfs.text("/path/to/file.txt");

// read JSON
const json = await hfs.json("/path/to/file.json");

// read bytes
const bytes = await hfs.bytes("/path/to/file.png");

// read buffer
const buffer = await hfs.arrayBuffer("/path/to/file.png");
```

### When Files Don't Exist

When you attempt to read a file that doesn't exist, each of these methods returns `undefined`. This is different than most filesystem APIs, which typically throw an error when a file doesn't exist. This allows you to avoid wrapping each call in `try-catch` just to account for files that don't exist. Instead, you can use an `if` statement:

```js
const text = await hfs.text("/path/to/file.txt");

if (!text) {
	// handle when the file doesn't exist
}
```

Alternatively, you can also use the nullish coalescing operator (`??`) to specify a default value when the file doesn't exist, as in this example:

```js
// read plain text
const text = (await hfs.text("/path/to/file.txt")) ?? "default value";

// read JSON
const json = (await hfs.json("/path/to/file.json")) ?? {};

// read bytes
const bytes =
	(await hfs.bytes("/path/to/file.png")) ?? new Uint8Array();
```

## Writing Files

To write files, call the `hfs.write()` method. This method accepts two arguments:

-   `filePath:string` - the path to write to
-   `value:string|ArrayBuffer|ArrayBufferView` - the value to write to the file

Here's an example:

```js
await hfs.write("/path/to/file.txt", "Hello world!");

const bytes = new TextEncoder().encode("Hello world!");

await hfs.write("/path/to/file.txt", bytes);
```

> [!TIP]
> This method will create any necessary parent directories that are missing in order to write the file. Effectively, it will run `mkdir -p` and then write the file.

## Detecting Files

To determine to if a file exists, use the `hfs.isFile(filePath)` method, which returns `true` if the given file exists or `false` otherwise.

```js
if (await hfs.isFile("/path/to/file.txt")) {
	// handle the file
}
```

> [!IMPORTANT]
> If the file doesn't exist, `hfs.isFile()` returns `false`. This method does not throw errors unless the filesystem cannot be accessed.

## Deleting Files

To delete files, call the `hfs.delete(filePath)` method. For example:

```js
await hfs.delete("/path/to/file.txt");
```

## Retrieving File Size

To get the size of a file in bytes, call the `hfs.size(filePath)` method. This method returns the size in bytes of the file if found and `undefined` if not found. Here's an example:

```js
const size = await hfs.size("/path/to/file.txt");
```

## Retrieving File Modification Time

To get the datetime when a file was last modified, call the `hfs.lastModified(filePath)` method. This method returns a `Date` object or `undefined` if the file isn't found. Here's an example:

```js
const mtime = await hfs.lastModified("/path/to/file.txt");
```

## Copying Files

To copy a file from one location to another, call the `hfs.copy(fromPath, toPath)` method. This method only works on files and will throw an error when attempting to copy a directory. Here's an example:

```js
await hfs.copy("/path/to/file.txt", "/path/to/other-file.txt");
```

## Moving Files

To move a file from one location to another, call the `hfs.move(fromPath, toPath)` method. This method only works on files and will throw an error when attempting to move a directory. Here's an example:

```js
await hfs.move("/path/to/file.txt", "/path/to/other-file.txt");
```
