/**
 * @fileoverview The main file for the hfs package.
 * @author Nicholas C. Zakas
 */
/* global Buffer:readonly, URL */

//-----------------------------------------------------------------------------
// Types
//-----------------------------------------------------------------------------

/** @typedef {import("@humanfs/types").HfsImpl} HfsImpl */
/** @typedef {import("@humanfs/types").HfsDirectoryEntry} HfsDirectoryEntry */
/** @typedef {import("node:fs/promises")} Fsp */
/** @typedef {import("fs").Dirent} Dirent */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { Hfs } from "@humanfs/core";
import path from "node:path";
import { Retrier } from "@humanwhocodes/retry";
import nativeFsp from "node:fs/promises";
import { fileURLToPath } from "node:url";

//-----------------------------------------------------------------------------
// Constants
//-----------------------------------------------------------------------------

const RETRY_ERROR_CODES = new Set(["ENFILE", "EMFILE"]);

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/**
 * A class representing a directory entry.
 * @implements {HfsDirectoryEntry}
 */
class NodeHfsDirectoryEntry {
	/**
	 * The name of the directory entry.
	 * @type {string}
	 */
	name;

	/**
	 * True if the entry is a file.
	 * @type {boolean}
	 */
	isFile;

	/**
	 * True if the entry is a directory.
	 * @type {boolean}
	 */
	isDirectory;

	/**
	 * True if the entry is a symbolic link.
	 * @type {boolean}
	 */
	isSymlink;

	/**
	 * Creates a new instance.
	 * @param {Dirent} dirent The directory entry to wrap.
	 */
	constructor(dirent) {
		this.name = dirent.name;
		this.isFile = dirent.isFile();
		this.isDirectory = dirent.isDirectory();
		this.isSymlink = dirent.isSymbolicLink();
	}
}

//-----------------------------------------------------------------------------
// Exports
//-----------------------------------------------------------------------------

/**
 * A class representing the Node.js implementation of Hfs.
 * @implements {HfsImpl}
 */
export class NodeHfsImpl {
	/**
	 * The file system module to use.
	 * @type {Fsp}
	 */
	#fsp;

	/**
	 * The retryer object used for retrying operations.
	 * @type {Retrier}
	 */
	#retrier;

	/**
	 * Creates a new instance.
	 * @param {object} [options] The options for the instance.
	 * @param {Fsp} [options.fsp] The file system module to use.
	 */
	constructor({ fsp = nativeFsp } = {}) {
		this.#fsp = fsp;
		this.#retrier = new Retrier(error => RETRY_ERROR_CODES.has(error.code));
	}

	/**
	 * Reads a file and returns the contents as a string. Assumes UTF-8 encoding.
	 * @param {string|URL} filePath The path to the file to read.
	 * @returns {Promise<string|undefined>} A promise that resolves with the contents of
	 *     the file or undefined if the file doesn't exist.
	 * @throws {TypeError} If the file path is not a string.
	 * @throws {RangeError} If the file path is empty.
	 * @throws {RangeError} If the file path is not absolute.
	 * @throws {RangeError} If the file path is not a file.
	 * @throws {RangeError} If the file path is not readable.
	 */
	text(filePath) {
		return this.#retrier
			.retry(() => this.#fsp.readFile(filePath, "utf8"))
			.catch(error => {
				if (error.code === "ENOENT") {
					return undefined;
				}

				throw error;
			});
	}

	/**
	 * Reads a file and returns the contents as a JSON object. Assumes UTF-8 encoding.
	 * @param {string|URL} filePath The path to the file to read.
	 * @returns {Promise<object|undefined>} A promise that resolves with the contents of
	 *    the file or undefined if the file doesn't exist.
	 * @throws {SyntaxError} If the file contents are not valid JSON.
	 * @throws {Error} If the file cannot be read.
	 * @throws {TypeError} If the file path is not a string.
	 */
	json(filePath) {
		return this.text(filePath).then(text =>
			text === undefined ? text : JSON.parse(text),
		);
	}

	/**
	 * Reads a file and returns the contents as an ArrayBuffer.
	 * @param {string|URL} filePath The path to the file to read.
	 * @returns {Promise<ArrayBuffer|undefined>} A promise that resolves with the contents
	 *    of the file or undefined if the file doesn't exist.
	 * @throws {Error} If the file cannot be read.
	 * @throws {TypeError} If the file path is not a string.
	 * @deprecated Use bytes() instead.
	 */
	arrayBuffer(filePath) {
		return this.bytes(filePath).then(bytes =>
			bytes === undefined ? bytes : bytes.buffer,
		);
	}

	/**
	 * Reads a file and returns the contents as an Uint8Array.
	 * @param {string|URL} filePath The path to the file to read.
	 * @returns {Promise<Uint8Array|undefined>} A promise that resolves with the contents
	 *    of the file or undefined if the file doesn't exist.
	 * @throws {Error} If the file cannot be read.
	 * @throws {TypeError} If the file path is not a string.
	 */
	bytes(filePath) {
		return this.#retrier
			.retry(() => this.#fsp.readFile(filePath))
			.then(buffer => new Uint8Array(buffer.buffer))
			.catch(error => {
				if (error.code === "ENOENT") {
					return undefined;
				}

				throw error;
			});
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
			value = Buffer.from(contents);
		} else if (ArrayBuffer.isView(contents)) {
			const bytes = contents.buffer.slice(
				contents.byteOffset,
				contents.byteOffset + contents.byteLength,
			);
			value = Buffer.from(bytes);
		}

		return this.#retrier
			.retry(() => this.#fsp.writeFile(filePath, value))
			.catch(error => {
				// the directory may not exist, so create it
				if (error.code === "ENOENT") {
					const dirPath = path.dirname(
						filePath instanceof URL
							? fileURLToPath(filePath)
							: filePath,
					);

					return this.#fsp
						.mkdir(dirPath, { recursive: true })
						.then(() => this.#fsp.writeFile(filePath, value));
				}

				throw error;
			});
	}

	/**
	 * Checks if a file exists.
	 * @param {string|URL} filePath The path to the file to check.
	 * @returns {Promise<boolean>} A promise that resolves with true if the
	 *    file exists or false if it does not.
	 * @throws {Error} If the operation fails with a code other than ENOENT.
	 */
	isFile(filePath) {
		return this.#fsp
			.stat(filePath)
			.then(stat => stat.isFile())
			.catch(error => {
				if (error.code === "ENOENT") {
					return false;
				}

				throw error;
			});
	}

	/**
	 * Checks if a directory exists.
	 * @param {string|URL} dirPath The path to the directory to check.
	 * @returns {Promise<boolean>} A promise that resolves with true if the
	 *    directory exists or false if it does not.
	 * @throws {Error} If the operation fails with a code other than ENOENT.
	 */
	isDirectory(dirPath) {
		return this.#fsp
			.stat(dirPath)
			.then(stat => stat.isDirectory())
			.catch(error => {
				if (error.code === "ENOENT") {
					return false;
				}

				throw error;
			});
	}

	/**
	 * Creates a directory recursively.
	 * @param {string|URL} dirPath The path to the directory to create.
	 * @returns {Promise<void>} A promise that resolves when the directory is
	 *   created.
	 */
	async createDirectory(dirPath) {
		await this.#fsp.mkdir(dirPath, { recursive: true });
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
	delete(fileOrDirPath) {
		return this.#fsp.rm(fileOrDirPath).catch(error => {
			if (error.code === "ERR_FS_EISDIR") {
				return this.#fsp.rmdir(fileOrDirPath);
			}

			throw error;
		});
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
	deleteAll(fileOrDirPath) {
		return this.#fsp.rm(fileOrDirPath, { recursive: true });
	}

	/**
	 * Returns a list of directory entries for the given path.
	 * @param {string|URL} dirPath The path to the directory to read.
	 * @returns {AsyncIterable<HfsDirectoryEntry>} A promise that resolves with the
	 *   directory entries.
	 * @throws {TypeError} If the directory path is not a string.
	 * @throws {Error} If the directory cannot be read.
	 */
	async *list(dirPath) {
		const entries = await this.#fsp.readdir(dirPath, {
			withFileTypes: true,
		});

		for (const entry of entries) {
			yield new NodeHfsDirectoryEntry(entry);
		}
	}

	/**
	 * Returns the size of a file.
	 * @param {string|URL} filePath The path to the file to read.
	 * @returns {Promise<number|undefined>} A promise that resolves with the size of the
	 *  file in bytes or undefined if the file doesn't exist.
	 */
	size(filePath) {
		return this.#fsp
			.stat(filePath)
			.then(stat => stat.size)
			.catch(error => {
				if (error.code === "ENOENT") {
					return undefined;
				}

				throw error;
			});
	}
}

/**
 * A class representing a file system utility library.
 * @implements {HfsImpl}
 */
export class NodeHfs extends Hfs {
	/**
	 * Creates a new instance.
	 * @param {object} [options] The options for the instance.
	 * @param {Fsp} [options.fsp] The file system module to use.
	 */
	constructor({ fsp } = {}) {
		super({ impl: new NodeHfsImpl({ fsp }) });
	}
}

export const hfs = new NodeHfs();
