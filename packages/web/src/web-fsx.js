/**
 * @fileoverview The main file for the fsx package.
 * @author Nicholas C. Zakas
 */
/* global navigator */

//-----------------------------------------------------------------------------
// Types
//-----------------------------------------------------------------------------

/** @typedef{import("fsx-types").FsxImpl} FsxImpl */
/** @typedef{import("fsx-types").FsxDirectoryEntry} FsxDirectoryEntry */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { Fsx } from "fsx-core";

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/**
 * Normalizes a path to use forward slashes.
 * @param {string} filePath The path to normalize.
 * @returns {string} The normalized path.
 */
function normalizePath(filePath) {
	let startIndex = 0;
	let endIndex = filePath.length;

	// strip off any leading ./ or / characters
	if (filePath.startsWith("./")) {
		startIndex = 2;
	}

	if (filePath.startsWith("/")) {
		startIndex = 1;
	}

	if (filePath.endsWith("/")) {
		endIndex = filePath.length - 1;
	}

	return filePath.slice(startIndex, endIndex).replace(/\\/g, "/");
}

/**
 * Gets the steps in a path.
 * @param {string} filePath The path to get steps for.
 * @returns {string[]} The steps in the path.
 */
function getPathSteps(filePath) {
	return normalizePath(filePath).split("/");
}

/**
 * Finds a file or directory in the OPFS root.
 * @param {FileSystemDirectoryHandle} root The root directory to search.
 * @param {string} fileOrDirPath The path to the file or directory to find.
 * @param {object} [options] The options for finding.
 * @param {boolean} [options.returnParent] True if the parent directory should be
 *  returned instead of the file or directory.
 * @param {boolean} [options.create] True if the file or directory should be
 *  created if it doesn't exist.
 * @returns {Promise<FileSystemHandle|undefined>} The file or directory found.
 */
async function findPath(
	root,
	fileOrDirPath,
	{ returnParent = false, create = false } = {},
) {
	const steps = getPathSteps(fileOrDirPath);

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

		name = steps.shift();
	}

	return undefined;
}

/**
 * Reads a file from the specified root.
 * @param {FileSystemDirectoryHandle} root The root directory to search.
 * @param {string} filePath The path to the file to read.
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
 * A class representing the Node.js implementation of Fsx.
 * @implements {FsxImpl}
 */
export class WebFsxImpl {
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
	 * @param {string} filePath The path to the file to read.
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
	 * @param {string} filePath The path to the file to read.
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
	 * @param {string} filePath The path to the file to read.
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
	 * @param {string} filePath The path to the file to read.
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
	 * @param {string} filePath The path to the file to write.
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
			const name = getPathSteps(filePath).pop();
			const parentHandle =
				/** @type {FileSystemDirectoryHandle} */ (
					await findPath(this.#root, filePath, {
						create: true,
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
	 * Checks if a file exists.
	 * @param {string} filePath The path to the file to check.
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
	 * @param {string} dirPath The path to the directory to check.
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
	 * @param {string} dirPath The path to the directory to create.
	 * @returns {Promise<void>} A promise that resolves when the directory is
	 *   created.
	 */
	async createDirectory(dirPath) {
		const steps = getPathSteps(dirPath);
		let handle = this.#root;
		let name = steps.shift();

		while (name) {
			handle = await handle.getDirectoryHandle(name, { create: true });
			name = steps.shift();
		}
	}

	/**
	 * Deletes a file or empty directory.
	 * @param {string} fileOrDirPath The path to the file or directory to
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

		parentHandle.removeEntry(handle.name);
	}

	/**
	 * Deletes a file or directory recursively.
	 * @param {string} fileOrDirPath The path to the file or directory to
	 *   delete.
	 * @returns {Promise<void>} A promise that resolves when the file or
	 *   directory is deleted.
	 * @throws {TypeError} If the file or directory path is not a string.
	 * @throws {Error} If the file or directory cannot be deleted.
	 * @throws {Error} If the file or directory is not found.
	 */
	async deleteAll(fileOrDirPath) {
		const handle = await findPath(this.#root, fileOrDirPath);

		/*
		 * Note: This is a workaround for Chrome not supporting the
		 * `recursive` option on `FileSystemDirectoryHandle.removeEntry()`. This will be
		 * removed when Chrome supports it.
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
	 * @param {string} dirPath The path to the directory to read.
	 * @returns {AsyncIterable<FsxDirectoryEntry>} A promise that resolves with the
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
}

/**
 * A class representing a file system utility library.
 * @implements {FsxImpl}
 */
export class WebFsx extends Fsx {
	/**
	 * Creates a new instance.
	 * @param {object} options The options for the instance.
	 * @param {FileSystemDirectoryHandle} options.root The root directory to work on.
	 */
	constructor({ root }) {
		super({ impl: new WebFsxImpl({ root }) });
	}
}

export const fsx = new WebFsx({ root: await navigator.storage.getDirectory() });
