/**
 * @fileoverview The main file for the hfs package.
 * @author Nicholas C. Zakas
 */
/* global TextEncoder, TextDecoder, URL */

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
 * Checks if a value is a file.
 * @param {string|ArrayBuffer|object|undefined} value The value to check.
 * @returns {boolean} True if the value is a file, false if not.
 */
function isFile(value) {
	return typeof value === "string" || value instanceof ArrayBuffer;
}

/**
 * Checks if a value is a directory.
 * @param {string|ArrayBuffer|object|undefined} value The value to check.
 * @returns {boolean} True if the value is a directory, false if not.
 */
function isDirectory(value) {
	return typeof value === "object" && !isFile(value);
}

/**
 * Finds a file or directory in the volume.
 * @param {object} volume The volume to search.
 * @param {string|URL} fileOrDirPath The path to the file or directory to find.
 * @returns {{object:object,key:string}|undefined} The file or directory found.
 */
function findPath(volume, fileOrDirPath) {
	const path =
		fileOrDirPath instanceof URL
			? Path.fromURL(fileOrDirPath)
			: Path.fromString(fileOrDirPath);
	const parts = [...path];

	let object = volume;
	let key = parts.shift();

	while (object[key]) {
		if (parts.length === 0) {
			return { object, key };
		}

		object = object[key];
		key = parts.shift();
	}

	return undefined;
}

/**
 * Finds a file or directory in the volume.
 * @param {object} volume The volume to search.
 * @param {string|URL} fileOrDirPath The path to the file or directory to find.
 * @returns {string|ArrayBuffer|object|undefined} The file or directory found.
 */
function readPath(volume, fileOrDirPath) {
	const location = findPath(volume, fileOrDirPath);

	if (!location) {
		return undefined;
	}

	const { object, key } = location;
	return object[key];
}

/**
 * Writes a file or directory to the volume.
 * @param {object} volume The volume to search.
 * @param {string|URL} fileOrDirPath The path to the file or directory to find.
 * @param {string|ArrayBuffer|object|undefined} value The value to write.
 * @returns {void}
 */
function writePath(volume, fileOrDirPath, value) {
	const path =
		fileOrDirPath instanceof URL
			? Path.fromURL(fileOrDirPath)
			: Path.fromString(fileOrDirPath);
	const parts = [...path];
	let part = parts.shift();
	let object = volume;

	do {
		let entry = object[part];

		if (!entry) {
			entry = object[part] = {};
		}

		object = entry;
		part = parts.shift();
	} while (parts.length > 0);

	// we don't want to overwrite an existing directory
	if (object && isDirectory(object[part]) && isDirectory(value)) {
		return;
	}

	object[part] = value;
}

//-----------------------------------------------------------------------------
// Exports
//-----------------------------------------------------------------------------

/**
 * A class representing the Node.js implementation of Hfs.
 * @implements {HfsImpl}
 */
export class MemoryHfsImpl {
	/**
	 * The in-memory file system volume to use.
	 * @type {object}
	 */
	#volume;

	/**
	 * Creates a new instance.
	 * @param {object} [options={}] The options for the instance.
	 * @param {object} [options.volume] The in-memory file system volume to use.
	 */
	constructor({ volume = {} } = {}) {
		this.#volume = volume;
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
		const value = readPath(this.#volume, filePath);

		if (!isFile(value)) {
			return undefined;
		}

		if (value instanceof ArrayBuffer) {
			return new TextDecoder().decode(value);
		}

		return value;
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
		const value = readPath(this.#volume, filePath);

		if (!isFile(value)) {
			return undefined;
		}

		if (typeof value === "string") {
			return new TextEncoder().encode(value).buffer;
		}

		return value;
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
		const value = readPath(this.#volume, filePath);

		if (!isFile(value)) {
			return undefined;
		}

		if (typeof value === "string") {
			return new TextEncoder().encode(value);
		}

		return value;
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

		return writePath(this.#volume, filePath, value);
	}

	/**
	 * Checks if a file exists.
	 * @param {string|URL} filePath The path to the file to check.
	 * @returns {Promise<boolean>} A promise that resolves with true if the
	 *    file exists or false if it does not.
	 * @throws {TypeError} If the file path is not a string.
	 */
	async isFile(filePath) {
		const location = findPath(this.#volume, filePath);

		if (!location) {
			return false;
		}

		const { object, key } = location;

		return isFile(object[key]);
	}

	/**
	 * Checks if a directory exists.
	 * @param {string|URL} dirPath The path to the directory to check.
	 * @returns {Promise<boolean>} A promise that resolves with true if the
	 *    directory exists or false if it does not.
	 * @throws {TypeError} If the directory path is not a string.
	 */
	async isDirectory(dirPath) {
		const location = findPath(this.#volume, dirPath);

		if (!location) {
			return false;
		}

		const { object, key } = location;
		return isDirectory(object[key]);
	}

	/**
	 * Creates a directory recursively.
	 * @param {string|URL} dirPath The path to the directory to create.
	 * @returns {Promise<void>} A promise that resolves when the directory is
	 *   created.
	 */
	async createDirectory(dirPath) {
		writePath(this.#volume, dirPath, {});
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
		const location = findPath(this.#volume, fileOrDirPath);

		if (!location) {
			throw new Error(
				`ENOENT: no such file or directory, unlink '${fileOrDirPath}'`,
			);
		}

		const { object, key } = location;

		const value = object[key];

		if (isDirectory(value) && Object.keys(value).length > 0) {
			throw new Error(
				`ENOTEMPTY: directory not empty, rmdir '${fileOrDirPath}'`,
			);
		}

		delete object[key];
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
		const location = findPath(this.#volume, fileOrDirPath);

		if (!location) {
			throw new Error(
				`ENOENT: no such file or directory, unlink '${fileOrDirPath}'`,
			);
		}

		const { object, key } = location;

		delete object[key];
	}

	/**
	 * Returns a list of directory entries for the given path.
	 * @param {string|URL} dirPath The path to the directory to read.
	 * @returns {AsyncIterable<HfsDirectoryEntry>} A promise that resolves with the
	 *   directory entries.
	 */
	async *list(dirPath) {
		let target;

		// Special case: if the path is ".", then we're listing the root
		if (dirPath === ".") {
			target = this.#volume;
		} else {
			const location = findPath(this.#volume, dirPath);

			if (!location) {
				throw new Error(
					`ENOENT: no such file or directory, list '${dirPath}'`,
				);
			}

			const { object, key } = location;
			target = object[key];
		}

		for (const [name, value] of Object.entries(target)) {
			yield {
				name,
				isDirectory: isDirectory(value),
				isFile: isFile(value),
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
		const value = readPath(this.#volume, filePath);

		if (!isFile(value)) {
			return undefined;
		}

		if (value instanceof ArrayBuffer) {
			return value.byteLength;
		}

		// use byteLength for strings for accuracy
		return new TextEncoder().encode(value).byteLength;
	}

	/**
	 * Copies a file from one location to another.
	 * @param {string|URL} fromPath The path to the file to copy.
	 * @param {string|URL} toPath The path to the destination file.
	 * @returns {Promise<void>} A promise that resolves when the file is copied.
	 * @throws {Error} If the source file does not exist.
	 * @throws {Error} If the source file is a directory.
	 * @throws {Error} If the destination file is a directory.
	 */
	async copy(fromPath, toPath) {
		const value = readPath(this.#volume, fromPath);

		if (!value) {
			throw new Error(
				`ENOENT: no such file, copy '${fromPath}' -> '${toPath}'`,
			);
		}

		if (!isFile(value)) {
			throw new Error(
				`EISDIR: illegal operation on a directory, copy '${fromPath}' -> '${toPath}'`,
			);
		}

		if (await this.isDirectory(toPath)) {
			throw new Error(
				`EISDIR: illegal operation on a directory, copy '${fromPath}' -> '${toPath}'`,
			);
		}

		writePath(this.#volume, toPath, value);
	}
}

/**
 * A class representing a file system utility library.
 * @implements {HfsImpl}
 */
export class MemoryHfs extends Hfs {
	/**
	 * Creates a new instance.
	 * @param {object} [options={}] The options for the instance.
	 * @param {object} [options.volume] The in-memory file system volume to use.
	 */
	constructor({ volume } = {}) {
		super({ impl: new MemoryHfsImpl({ volume }) });
	}
}

export const hfs = new MemoryHfs();
