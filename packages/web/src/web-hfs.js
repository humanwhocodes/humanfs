/**
 * @fileoverview The main file for the hfs package.
 * @author Nicholas C. Zakas
 */
/* global navigator, URL, TextEncoder */

//-----------------------------------------------------------------------------
// Types
//-----------------------------------------------------------------------------

/** @typedef{import("@humanfs/types").HfsImpl} HfsImpl */
/** @typedef{import("@humanfs/types").HfsDirectoryEntry} HfsDirectoryEntry */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { Hfs, Path } from "@humanfs/core";

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/**
 * Finds a file or directory in the OPFS root.
 * @param {FileSystemDirectoryHandle} root The root directory to search.
 * @param {string|URL} fileOrDirPath The path to the file or directory to find.
 * @param {object} [options] The options for finding.
 * @param {boolean} [options.returnParent] True if the parent directory should be
 *  returned instead of the file or directory.
 * @param {boolean} [options.create] True if the file or directory should be
 *  created if it doesn't exist.
 * @param {"file"|"directory"} [options.kind] The kind of file or directory to find.
 * @returns {Promise<FileSystemHandle|undefined>} The file or directory found.
 */
async function findPath(
	root,
	fileOrDirPath,
	{ returnParent = false, create = false, kind } = {},
) {
	// Special case: "." means the root directory
	if (fileOrDirPath === ".") {
		return root;
	}

	const path =
		fileOrDirPath instanceof URL
			? Path.fromURL(fileOrDirPath)
			: Path.fromString(fileOrDirPath);

	const steps = [...path];

	if (returnParent) {
		steps.pop();
	}

	let handle = root;
	let name = steps.shift();

	while (handle && name) {
		// `name` must represent a directory
		if (steps.length > 0) {
			try {
				handle = await handle.getDirectoryHandle(name, { create });
			} catch {
				return undefined;
			}
		} else {
			if (!kind) {
				try {
					return await handle.getDirectoryHandle(name, { create });
				} catch {
					try {
						return await handle.getFileHandle(name, { create });
					} catch {
						return undefined;
					}
				}
			}

			if (kind === "directory") {
				try {
					return await handle.getDirectoryHandle(name, { create });
				} catch {
					return undefined;
				}
			}

			if (kind === "file") {
				try {
					return await handle.getFileHandle(name, { create });
				} catch {
					return undefined;
				}
			}
		}

		name = steps.shift();
	}

	return undefined;
}

/**
 * Reads a file from the specified root.
 * @param {FileSystemDirectoryHandle} root The root directory to search.
 * @param {string|URL} filePath The path to the file to read.
 * @param {"text"|"arrayBuffer"} dataType The type of data to read.
 * @returns {Promise<string|ArrayBuffer|undefined>} The contents of the file or
 *   undefined if the file does not exist.
 */
async function readFile(root, filePath, dataType) {
	const handle = await findPath(root, filePath);

	if (!handle || handle.kind !== "file") {
		return undefined;
	}

	const fileHandle = /** @type {FileSystemFileHandle} */ (handle);
	const file = await fileHandle.getFile();

	if (dataType === "arrayBuffer") {
		return file.arrayBuffer();
	}

	return file.text();
}

//-----------------------------------------------------------------------------
// Exports
//-----------------------------------------------------------------------------

/**
 * A class representing the Node.js implementation of Hfs.
 * @implements {HfsImpl}
 */
export class WebHfsImpl {
	/**
	 * The root directory to work on.
	 * @type {FileSystemDirectoryHandle}
	 */
	#root;

	/**
	 * Creates a new instance.
	 * @param {object} options The options for the instance.
	 * @param {FileSystemDirectoryHandle} options.root The root directory to work on.
	 * @throws {TypeError} If options.root is not provided.
	 */
	constructor({ root }) {
		if (!root) {
			throw new TypeError("options.root is required");
		}

		this.#root = root;
	}

	/**
	 * Reads a file and returns the contents as a string. Assumes UTF-8 encoding.
	 * @param {string|URL} filePath The path to the file to read.
	 * @returns {Promise<string|undefined>} A promise that resolves with the contents of
	 *     the file or undefined if the file does not exist.
	 * @throws {TypeError} If the file path is not a string.
	 * @throws {RangeError} If the file path is not absolute.
	 * @throws {RangeError} If the file path is not a file.
	 * @throws {RangeError} If the file path is not readable.
	 */
	async text(filePath) {
		const text = /** @type {string|undefined} */ (
			await readFile(this.#root, filePath, "text")
		);
		return text;
	}

	/**
	 * Reads a file and returns the contents as a JSON object. Assumes UTF-8 encoding.
	 * @param {string|URL} filePath The path to the file to read.
	 * @returns {Promise<object|null>} A promise that resolves with the contents of
	 *    the file or undefined if the file does not exist.
	 * @throws {SyntaxError} If the file contents are not valid JSON.
	 * @throws {Error} If the file cannot be read.
	 * @throws {TypeError} If the file path is not a string.
	 */
	async json(filePath) {
		return this.text(filePath).then(text =>
			text === undefined ? text : JSON.parse(text),
		);
	}

	/**
	 * Reads a file and returns the contents as an ArrayBuffer.
	 * @param {string|URL} filePath The path to the file to read.
	 * @returns {Promise<ArrayBuffer|undefined>} A promise that resolves with the contents
	 *    of the file or undefined if the file does not exist.
	 * @throws {Error} If the file cannot be read.
	 * @throws {TypeError} If the file path is not a string.
	 * @deprecated Use bytes() instead.
	 */
	async arrayBuffer(filePath) {
		const buffer = /** @type {ArrayBuffer|undefined} */ (
			await readFile(this.#root, filePath, "arrayBuffer")
		);
		return buffer;
	}

	/**
	 * Reads a file and returns the contents as an Uint8Array.
	 * @param {string|URL} filePath The path to the file to read.
	 * @returns {Promise<Uint8Array|undefined>} A promise that resolves with the contents
	 *    of the file or undefined if the file does not exist.
	 * @throws {Error} If the file cannot be read.
	 * @throws {TypeError} If the file path is not a string.
	 */
	async bytes(filePath) {
		const buffer = /** @type {ArrayBuffer|undefined} */ (
			await readFile(this.#root, filePath, "arrayBuffer")
		);
		return buffer ? new Uint8Array(buffer) : undefined;
	}

	/**
	 * Writes a value to a file. If the value is a string, UTF-8 encoding is used.
	 * @param {string|URL} filePath The path to the file to write.
	 * @param {string|ArrayBuffer|ArrayBufferView} contents The contents to write to the
	 *   file.
	 * @returns {Promise<void>} A promise that resolves when the file is
	 *  written.
	 * @throws {TypeError} If the file path is not a string.
	 * @throws {Error} If the file cannot be written.
	 */
	async write(filePath, contents) {
		let value;

		if (typeof contents === "string") {
			value = contents;
		} else if (contents instanceof ArrayBuffer) {
			value = contents;
		} else if (ArrayBuffer.isView(contents)) {
			value = contents.buffer.slice(
				contents.byteOffset,
				contents.byteOffset + contents.byteLength,
			);
		}

		let handle = /** @type {FileSystemFileHandle} */ (
			await findPath(this.#root, filePath)
		);

		if (!handle) {
			const path =
				filePath instanceof URL
					? Path.fromURL(filePath)
					: Path.fromString(filePath);
			const name = path.name;
			const parentHandle =
				/** @type {FileSystemDirectoryHandle} */ (
					await findPath(this.#root, filePath, {
						create: true,
						kind: "directory",
						returnParent: true,
					})
				) ?? this.#root;
			handle = await parentHandle.getFileHandle(name, { create: true });
		}

		const writable = await handle.createWritable();
		await writable.write(value);
		await writable.close();
	}

	/**
	 * Appends a value to a file. If the value is a string, UTF-8 encoding is used.
	 * @param {string|URL} filePath The path to the file to append to.
	 * @param {string|ArrayBuffer|ArrayBufferView} contents The contents to append to the
	 *  file.
	 * @returns {Promise<void>} A promise that resolves when the file is
	 * written.
	 * @throws {TypeError} If the file path is not a string.
	 * @throws {Error} If the file cannot be appended to.
	 */
	async append(filePath, contents) {
		const handle = /** @type {FileSystemFileHandle} */ (
			await findPath(this.#root, filePath)
		);

		// if there's no existing file, just write the contents
		if (!handle) {
			return this.write(filePath, contents);
		}

		// can't write to a directory
		if (handle.kind !== "file") {
			throw new Error(
				`EISDIR: illegal operation on a directory, open '${filePath}'`,
			);
		}

		const existing = await (await handle.getFile()).arrayBuffer();

		// contents must be an ArrayBuffer or ArrayBufferView

		const valueToAppend = /** @type {ArrayBuffer} */ (
			ArrayBuffer.isView(contents)
				? contents.buffer.slice(
						contents.byteOffset,
						contents.byteOffset + contents.byteLength,
					)
				: typeof contents === "string"
					? new TextEncoder().encode(contents).buffer
					: contents
		);

		const newValue = new Uint8Array([
			...new Uint8Array(existing),
			...new Uint8Array(valueToAppend),
		]).buffer;

		return this.write(filePath, newValue);
	}

	/**
	 * Checks if a file exists.
	 * @param {string|URL} filePath The path to the file to check.
	 * @returns {Promise<boolean>} A promise that resolves with true if the
	 *    file exists or false if it does not.
	 * @throws {TypeError} If the file path is not a string.
	 */
	async isFile(filePath) {
		const handle = await findPath(this.#root, filePath);
		return !!(handle && handle.kind === "file");
	}

	/**
	 * Checks if a directory exists.
	 * @param {string|URL} dirPath The path to the directory to check.
	 * @returns {Promise<boolean>} A promise that resolves with true if the
	 *    directory exists or false if it does not.
	 * @throws {TypeError} If the directory path is not a string.
	 */
	async isDirectory(dirPath) {
		const handle = await findPath(this.#root, dirPath);
		return !!(handle && handle.kind === "directory");
	}

	/**
	 * Creates a directory recursively.
	 * @param {string|URL} dirPath The path to the directory to create.
	 * @returns {Promise<void>} A promise that resolves when the directory is
	 *   created.
	 */
	async createDirectory(dirPath) {
		let handle = this.#root;
		const path =
			dirPath instanceof URL
				? Path.fromURL(dirPath)
				: Path.fromString(dirPath);

		for (const name of path) {
			handle = await handle.getDirectoryHandle(name, { create: true });
		}
	}

	/**
	 * Deletes a file or empty directory.
	 * @param {string|URL} fileOrDirPath The path to the file or directory to
	 *   delete.
	 * @returns {Promise<void>} A promise that resolves when the file or
	 *   directory is deleted.
	 * @throws {TypeError} If the file or directory path is not a string.
	 * @throws {Error} If the file or directory cannot be deleted.
	 * @throws {Error} If the file or directory is not found.
	 */
	async delete(fileOrDirPath) {
		const handle = await findPath(this.#root, fileOrDirPath);
		const parentHandle =
			/** @type {FileSystemDirectoryHandle} */ (
				await findPath(this.#root, fileOrDirPath, {
					returnParent: true,
				})
			) ?? this.#root;

		if (!handle) {
			throw new Error(
				`ENOENT: no such file or directory, unlink '${fileOrDirPath}'`,
			);
		}

		// nonempty directories must not be deleted
		if (handle.kind === "directory") {
			// @ts-ignore -- TS doesn't know about this yet
			const entries = handle.values();
			const next = await entries.next();
			if (!next.done) {
				throw new Error(
					`ENOTEMPTY: directory not empty, rmdir '${fileOrDirPath}'`,
				);
			}
		}

		parentHandle.removeEntry(handle.name);
	}

	/**
	 * Deletes a file or directory recursively.
	 * @param {string|URL} fileOrDirPath The path to the file or directory to
	 *   delete.
	 * @returns {Promise<void>} A promise that resolves when the file or
	 *   directory is deleted.
	 * @throws {TypeError} If the file or directory path is not a string.
	 * @throws {Error} If the file or directory cannot be deleted.
	 * @throws {Error} If the file or directory is not found.
	 */
	async deleteAll(fileOrDirPath) {
		const handle = await findPath(this.#root, fileOrDirPath);

		if (!handle) {
			throw new Error(
				`ENOENT: no such file or directory, unlink '${fileOrDirPath}'`,
			);
		}

		/*
		 * Note: For some reason, Chromium is not respecting the
		 * `recursive` option on `FileSystemDirectoryHandle.removeEntry()`.
		 * I've been unable to come up with a minimal repro case to demonstrate.
		 * Need to investigate further.
		 * https://bugs.chromium.org/p/chromium/issues/detail?id=1521975
		 */

		// @ts-ignore -- only supported by Chrome right now
		if (handle.remove) {
			// @ts-ignore -- only supported by Chrome right now
			await handle.remove({ recursive: true });
			return;
		}

		const parentHandle =
			/** @type {FileSystemDirectoryHandle} */ (
				await findPath(this.#root, fileOrDirPath, {
					returnParent: true,
				})
			) ?? this.#root;

		if (!handle) {
			throw new Error(
				`ENOENT: no such file or directory, unlink '${fileOrDirPath}'`,
			);
		}
		parentHandle.removeEntry(handle.name, { recursive: true });
	}

	/**
	 * Returns a list of directory entries for the given path.
	 * @param {string|URL} dirPath The path to the directory to read.
	 * @returns {AsyncIterable<HfsDirectoryEntry>} A promise that resolves with the
	 *   directory entries.
	 */
	async *list(dirPath) {
		const handle = /** @type {FileSystemDirectoryHandle} */ (
			await findPath(this.#root, dirPath)
		);

		if (!handle) {
			return;
		}

		// @ts-ignore -- TS doesn't know about this yet
		for await (const entry of handle.values()) {
			const isDirectory = entry.kind === "directory";
			const isFile = entry.kind === "file";

			yield {
				name: entry.name,
				isDirectory,
				isFile,
				isSymlink: false,
			};
		}
	}

	/**
	 * Returns the size of a file.
	 * @param {string|URL} filePath The path to the file to read.
	 * @returns {Promise<number|undefined>} A promise that resolves with the size of the
	 *  file in bytes or undefined if the file doesn't exist.
	 */
	async size(filePath) {
		const handle = await findPath(this.#root, filePath);

		if (!handle || handle.kind !== "file") {
			return undefined;
		}

		const fileHandle = /** @type {FileSystemFileHandle} */ (handle);
		const file = await fileHandle.getFile();
		return file.size;
	}

	/**
	 * Copies a file from one location to another.
	 * @param {string|URL} source The path to the file to copy.
	 * @param {string|URL} destination The path to the destination file.
	 * @returns {Promise<void>} A promise that resolves when the file is copied.
	 */
	async copy(source, destination) {
		const fromHandle = /** @type {FileSystemFileHandle } */ (
			await findPath(this.#root, source)
		);

		if (!fromHandle) {
			throw new Error(
				`ENOENT: no such file, copy '${source}' -> '${destination}'`,
			);
		}

		if (fromHandle.kind !== "file") {
			throw new Error(
				`EISDIR: illegal operation on a directory, copy '${source}' -> '${destination}'`,
			);
		}

		if (await this.isDirectory(destination)) {
			throw new Error(
				`EISDIR: illegal operation on a directory, copy '${source}' -> '${destination}'`,
			);
		}

		const toHandle = /** @type {FileSystemFileHandle } */ (
			await findPath(this.#root, destination, {
				create: true,
				kind: "file",
			})
		);
		const file = await fromHandle.getFile();
		const writable = await toHandle.createWritable();
		await writable.write(file);
		await writable.close();
	}

	/**
	 * Copies a file or directory from one location to another.
	 * @param {string|URL} source The path to the file or directory to copy.
	 * @param {string|URL} destination The path to copy the file or directory to.
	 * @returns {Promise<void>} A promise that resolves when the file or directory is
	 * copied.
	 * @throws {Error} If the source file or directory does not exist.
	 * @throws {Error} If the destination file or directory is a directory.
	 */
	async copyAll(source, destination) {
		// for files use copy() and exit
		if (await this.isFile(source)) {
			return this.copy(source, destination);
		}

		// if the source isn't a directory then throw an error
		if (!(await this.isDirectory(source))) {
			throw new Error(
				`ENOENT: no such file or directory, copyAll '${source}' -> '${destination}'`,
			);
		}

		const sourcePath =
			source instanceof URL
				? Path.fromURL(source)
				: Path.fromString(source);

		const destinationPath =
			destination instanceof URL
				? Path.fromURL(destination)
				: Path.fromString(destination);

		// for directories, create the destination directory and copy each entry
		await this.createDirectory(destination);

		for await (const entry of this.list(source)) {
			destinationPath.push(entry.name);
			sourcePath.push(entry.name);

			if (entry.isDirectory) {
				await this.copyAll(
					sourcePath.toString(),
					destinationPath.toString(),
				);
			} else {
				await this.copy(
					sourcePath.toString(),
					destinationPath.toString(),
				);
			}

			destinationPath.pop();
			sourcePath.pop();
		}
	}

	/**
	 * Moves a file from the source path to the destination path.
	 * @param {string|URL} source The location of the file to move.
	 * @param {string|URL} destination The destination of the file to move.
	 * @returns {Promise<void>} A promise that resolves when the move is complete.
	 * @throws {TypeError} If the file paths are not strings.
	 * @throws {Error} If the file cannot be moved.
	 */
	async move(source, destination) {
		const handle = await findPath(this.#root, source);

		if (!handle) {
			throw new Error(
				`ENOENT: no such file or directory, move '${source}' -> '${destination}'`,
			);
		}

		if (handle.kind !== "file") {
			throw new Error(
				`EISDIR: illegal operation on a directory, move '${source}' -> '${destination}'`,
			);
		}

		const fileHandle = /** @type {FileSystemFileHandle} */ (handle);
		const destinationPath =
			destination instanceof URL
				? Path.fromURL(destination)
				: Path.fromString(destination);
		const destinationName = destinationPath.pop();
		const destinationParent = await findPath(
			this.#root,
			destinationPath.toString(),
			{ create: true, kind: "directory" },
		);

		const handleChromeError = async ex => {
			if (ex.name === "NotAllowedError") {
				await this.copy(source, destination);
				await this.delete(source);
				return;
			}
			throw ex;
		};

		return (
			fileHandle
				// @ts-ignore -- TS doesn't know about this yet
				.move(destinationParent, destinationName)
				.catch(handleChromeError)
		);
	}

	/**
	 * Moves a file or directory from one location to another.
	 * @param {string|URL} source The path to the file or directory to move.
	 * @param {string|URL} destination The path to move the file or directory to.
	 * @returns {Promise<void>} A promise that resolves when the file or directory is
	 * moved.
	 * @throws {Error} If the source file or directory does not exist.
	 */
	async moveAll(source, destination) {
		const handle = await findPath(this.#root, source);

		// if the source doesn't exist then throw an error
		if (!handle) {
			throw new Error(
				`ENOENT: no such file or directory, moveAll '${source}' -> '${destination}'`,
			);
		}

		// for files use move() and exit
		if (handle.kind === "file") {
			return this.move(source, destination);
		}

		const directoryHandle = /** @type {FileSystemDirectoryHandle} */ (
			handle
		);
		const destinationPath =
			destination instanceof URL
				? Path.fromURL(destination)
				: Path.fromString(destination);

		// Chrome doesn't yet support move() on directories
		// @ts-ignore -- TS doesn't know about this yet
		if (directoryHandle.move) {
			const destinationName = destinationPath.pop();
			const destinationParent = await findPath(
				this.#root,
				destinationPath.toString(),
				{ create: true, kind: "directory" },
			);

			// @ts-ignore -- TS doesn't know about this yet
			return directoryHandle.move(destinationParent, destinationName);
		}

		const sourcePath =
			source instanceof URL
				? Path.fromURL(source)
				: Path.fromString(source);

		// for directories, create the destination directory and move each entry
		await this.createDirectory(destination);

		for await (const entry of this.list(source)) {
			destinationPath.push(entry.name);
			sourcePath.push(entry.name);

			if (entry.isDirectory) {
				await this.moveAll(
					sourcePath.toString(),
					destinationPath.toString(),
				);
			} else {
				await this.move(
					sourcePath.toString(),
					destinationPath.toString(),
				);
			}

			destinationPath.pop();
			sourcePath.pop();
		}

		await this.delete(source);
	}
}

/**
 * A class representing a file system utility library.
 * @implements {HfsImpl}
 */
export class WebHfs extends Hfs {
	/**
	 * Creates a new instance.
	 * @param {object} options The options for the instance.
	 * @param {FileSystemDirectoryHandle} options.root The root directory to work on.
	 */
	constructor({ root }) {
		super({ impl: new WebHfsImpl({ root }) });
	}
}

export const hfs = new WebHfs({ root: await navigator.storage.getDirectory() });
