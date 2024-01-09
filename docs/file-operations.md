# File Operations


## Reading Files

Files are read by using the method that returns the specific data type that you want:

* `fsx.text(filePath)` reads the given file and returns a string.
* `fsx.json(filePath)` reads the given file and returns a JSON value.
* `fsx.arrayBuffer(filePath)` reads the given file and returns an `ArrayBuffer`.

Here are some examples:

```js
// read plain text
const text = await fsx.text("/path/to/file.txt");

// read JSON
const json = await fsx.json("/path/to/file.json");

// read bytes
const bytes = await fsx.arrayBuffer("/path/to/file.png");
```

### When Files Don't Exist

When you attempt to read a file that doesn't exist, each of these methods returns `undefined`. This is different than most filesystem APIs, which typically throw an error when a file doesn't exist. This allows you to avoid wrapping each call in `try-catch` just to account for files that don't exist. Instead, you can use an `if` statement:

```js
const text = await fsx.text("/path/to/file.txt");

if (!text) {
    // handle when the file doesn't exist
}
```

Alternatively, you can also use the nullish coalescing operator (`??`) to specify a default value when the file doesn't exist, as in this example:

```js
// read plain text
const text = await fsx.text("/path/to/file.txt") ?? "default value";

// read JSON
const json = await fsx.json("/path/to/file.json") ?? {};

// read bytes
const bytes = await fsx.arrayBuffer("/path/to/file.png") ?? new ArrayBuffer(16);
```

## Writing Files

To write files, call the `fsx.write()` method. This method accepts two arguments:

- `filePath:string` - the path to write to
- `value:string|ArrayBuffer` - the value to write to the file

Here's an example:

```js
fsx.write("/path/to/file.txt", "Hello world!");

const bytes = new TextEncoder().encode("Hello world!").buffer;

fsx.write("/path/to/file.txt", buffer);
```

> [!TIP]
> This method will create any necessary parent directories that are missing in order to write the file. Effectively, it will run `mkdir -p` and then write the file.

## Detecting Files

To determine to if a file exists, use the `fsx.isFile(filePath)` method, which returns `true` if the given file exists or `false` otherwise.

```js
if (fsx.isFile("/path/to/file.txt")) {
    // handle the file
}
```

> [!IMPORTANT]
> If the file doesn't exist, `fsx.isFile()` returns `false`. This method does not throw errors unless the filesystem cannot be accessed.

## Deleting Files

To delete files, call the `fsx.delete(filePath)` method. For example:

```js
fsx.delete("/path/to/file.txt");
```
