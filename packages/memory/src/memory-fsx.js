/**
 * @fileoverview The main file for the fsx package.
 * @author Nicholas C. Zakas
 */
/* global TextEncoder, TextDecoder */

//-----------------------------------------------------------------------------
// Types
//-----------------------------------------------------------------------------

/** @typedef{import("fsx-types").FsxImpl} FsxImpl */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { Fsx } from "fsx-core";

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
 * Finds a file or directory in the volume.
 * @param {object} volume The volume to search.
 * @param {string} fileOrDirPath The path to the file or directory to find.
 * @returns {{object:object,key:string}|undefined} The file or directory found.
 */
function findPath(volume, fileOrDirPath) {
	const parts = normalizePath(fileOrDirPath).split("/");

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
 * @param {string} fileOrDirPath The path to the file or directory to find.
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
 * @param {string} fileOrDirPath The path to the file or directory to find.
 * @param {string|ArrayBuffer|object|undefined} value The value to write.
 * @returns {void}
 */
function writePath(volume, fileOrDirPath, value) {
	const parts = normalizePath(fileOrDirPath).split("/");
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
 * A class representing the Node.js implementation of Fsx.
 * @implements {FsxImpl}
 */
export class MemoryFsxImpl {
	/**
	 * The in-memory file system volume to use.
	 * @type {object}
	 */
	#volume;

	/**
	 * Creates a new instance.
	 * @param {object} options The options for the instance.
	 * @param {object} options.volume The in-memory file system volume to use.
	 */
	constructor({ volume }) {
		this.#volume = volume;
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
	 * Writes a value to a file. If the value is a string, UTF-8 encoding is used.
	 * @param {string} filePath The path to the file to write.
	 * @param {string|ArrayBuffer} contents The contents to write to the
	 *   file.
	 * @returns {Promise<void>} A promise that resolves when the file is
	 *  written.
	 * @throws {TypeError} If the file path is not a string.
	 * @throws {Error} If the file cannot be written.
	 */
	async write(filePath, contents) {
		return writePath(this.#volume, filePath, contents);
	}

	/**
	 * Checks if a file exists.
	 * @param {string} filePath The path to the file to check.
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
	 * @param {string} dirPath The path to the directory to check.
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
	 * @param {string} dirPath The path to the directory to create.
	 * @returns {Promise<void>} A promise that resolves when the directory is
	 *   created.
	 */
	async createDirectory(dirPath) {
		writePath(this.#volume, dirPath, {});
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
	async delete(fileOrDirPath) {
		const location = findPath(this.#volume, fileOrDirPath);

		if (!location) {
			throw new Error(
				`ENOENT: no such file or directory, unlink '${fileOrDirPath}'`,
			);
		}

		const { object, key } = location;

		delete object[key];
	}
}

/**
 * A class representing a file system utility library.
 * @implements {FsxImpl}
 */
export class MemoryFsx extends Fsx {
	/**
	 * Creates a new instance.
	 * @param {object} options The options for the instance.
	 * @param {object} [options.volume] The in-memory file system volume to use.
	 */
	constructor({ volume } = {}) {
		super({ impl: new MemoryFsxImpl({ volume }) });
	}
}

export const fsx = new MemoryFsx();
