/**
 * @fileoverview The main file for the deno-hfs package.
 * @author Nicholas C. Zakas
 */
/* global Deno:readonly */

//-----------------------------------------------------------------------------
// Types
//-----------------------------------------------------------------------------

/** @typedef {import("@humanfs/types").HfsImpl} HfsImpl */
/** @typedef {import("@humanfs/types").HfsDirectoryEntry} HfsDirectoryEntry */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { Hfs } from "@humanfs/core";
import { Retrier } from "@humanwhocodes/retry";
import path from "node:path";

//-----------------------------------------------------------------------------
// Constants
//-----------------------------------------------------------------------------

const RETRY_ERROR_CODES = new Set(["ENFILE", "EMFILE"]);

//-----------------------------------------------------------------------------
// Exports
//-----------------------------------------------------------------------------

/**
 * A class representing the Node.js implementation of Hfs.
 * @implements {HfsImpl}
 */
export class DenoHfsImpl {
	/**
	 * The file system module to use.
	 * @type {object}
	 */
	#deno;

	/**
	 * The retryer object used for retrying operations.
	 * @type {Retrier}
	 */
	#retrier;

	/**
	 * Creates a new instance.
	 * @param {object} [options] The options for the instance.
	 * @param {Deno} [options.deno] The Deno object to use.
	 */
	constructor({ deno = Deno } = {}) {
		this.#deno = deno;
		this.#retrier = new Retrier(error => RETRY_ERROR_CODES.has(error.code));
	}

	/**
	 * Reads a file and returns the contents as a string. Assumes UTF-8 encoding.
	 * @param {string} filePath The path to the file to read.
	 * @returns {Promise<string>} A promise that resolves with the contents of
	 *     the file.
	 * @throws {TypeError} If the file path is not a string.
	 * @throws {RangeError} If the file path is empty.
	 * @throws {RangeError} If the file path is not absolute.
	 * @throws {RangeError} If the file path is not a file.
	 * @throws {RangeError} If the file path is not readable.
	 */
	text(filePath) {
		return this.#retrier
			.retry(() => this.#deno.readTextFile(filePath))
			.catch(error => {
				if (error.code === "ENOENT") {
					return undefined;
				}

				throw error;
			});
	}

	/**
	 * Reads a file and returns the contents as a JSON object. Assumes UTF-8 encoding.
	 * @param {string} filePath The path to the file to read.
	 * @returns {Promise<object>} A promise that resolves with the contents of
	 *    the file.
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
	 * @param {string} filePath The path to the file to read.
	 * @returns {Promise<ArrayBuffer|undefined>} A promise that resolves with the contents
	 *    of the file.
	 * @throws {Error} If the file cannot be read.
	 * @throws {TypeError} If the file path is not a string.
	 * @deprecated Use bytes() instead.
	 */
	arrayBuffer(filePath) {
		return this.bytes(filePath).then(bytes => bytes?.buffer);
	}

	/**
	 * Reads a file and returns the contents as an Uint8Array.
	 * @param {string} filePath The path to the file to read.
	 * @returns {Promise<Uint8Array|undefined>} A promise that resolves with the contents
	 *    of the file.
	 * @throws {Error} If the file cannot be read.
	 * @throws {TypeError} If the file path is not a string.
	 */
	bytes(filePath) {
		return this.#retrier
			.retry(() => this.#deno.readFile(filePath))
			.catch(error => {
				if (error.code === "ENOENT") {
					return undefined;
				}

				throw error;
			});
	}

	/**
	 * Writes a value to a file, creating any necessary directories along the way.
	 * If the value is a string, UTF-8 encoding is used.
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
		} else if (contents instanceof Uint8Array) {
			value = contents;
		} else if (contents instanceof ArrayBuffer) {
			value = new Uint8Array(contents);
		} else if (ArrayBuffer.isView(contents)) {
			const bytes = contents.buffer.slice(
				contents.byteOffset,
				contents.byteOffset + contents.byteLength,
			);
			value = new Uint8Array(bytes);
		}

		const op =
			typeof value === "string"
				? () =>
						this.#deno.writeTextFile(filePath, value, {
							create: true,
						})
				: () =>
						this.#deno.writeFile(filePath, new Uint8Array(value), {
							create: true,
						});

		return this.#retrier.retry(op).catch(error => {
			if (error.code === "ENOENT") {
				return this.#deno
					.mkdir(path.dirname(filePath), { recursive: true })
					.then(op);
			}

			throw error;
		});
	}

	/**
	 * Checks if a file exists.
	 * @param {string} filePath The path to the file to check.
	 * @returns {Promise<boolean>} A promise that resolves with true if the
	 *    file exists or false if it does not.
	 * @throws {Error} If the operation fails with a code other than ENOENT.
	 */
	isFile(filePath) {
		return this.#deno
			.stat(filePath)
			.then(stat => stat.isFile)
			.catch(error => {
				if (error.code === "ENOENT") {
					return false;
				}

				throw error;
			});
	}

	/**
	 * Checks if a directory exists.
	 * @param {string} dirPath The path to the directory to check.
	 * @returns {Promise<boolean>} A promise that resolves with true if the
	 *    directory exists or false if it does not.
	 * @throws {Error} If the operation fails with a code other than ENOENT.
	 */
	isDirectory(dirPath) {
		return this.#deno
			.stat(dirPath)
			.then(stat => stat.isDirectory)
			.catch(error => {
				if (error.code === "ENOENT") {
					return false;
				}

				throw error;
			});
	}

	/**
	 * Creates a directory recursively.
	 * @param {string} dirPath The path to the directory to create.
	 * @returns {Promise<void>} A promise that resolves when the directory is
	 *   created.
	 */
	async createDirectory(dirPath) {
		await this.#deno.mkdir(dirPath, { recursive: true });
	}

	/**
	 * Deletes a file or empty directory.
	 * @param {string} filePath The path to the file or directory to
	 *   delete.
	 * @returns {Promise<void>} A promise that resolves when the file or
	 *   directory is deleted.
	 * @throws {TypeError} If the file or directory path is not a string.
	 * @throws {Error} If the file or directory cannot be deleted.
	 * @throws {Error} If the file or directory is not found.
	 */
	delete(filePath) {
		return this.#deno.remove(filePath);
	}

	/**
	 * Deletes a file or directory recursively.
	 * @param {string} filePath The path to the file or directory to
	 *   delete.
	 * @returns {Promise<void>} A promise that resolves when the file or
	 *   directory is deleted.
	 * @throws {TypeError} If the file or directory path is not a string.
	 * @throws {Error} If the file or directory cannot be deleted.
	 * @throws {Error} If the file or directory is not found.
	 */
	deleteAll(filePath) {
		return this.#deno.remove(filePath, { recursive: true });
	}

	/**
	 * Lists the files and directories in a directory.
	 * @param {string} dirPath The path to the directory to list.
	 * @returns {AsyncIterable<HfsDirectoryEntry>} An async iterator
	 *  that yields the files and directories in the directory.
	 */
	async *list(dirPath) {
		yield* this.#deno.readDir(dirPath);
	}

	/**
	 * Returns the size of a file.
	 * @param {string} filePath The path to the file to read.
	 * @returns {Promise<number|undefined>} A promise that resolves with the size of the
	 *  file in bytes or undefined if the file doesn't exist.
	 */
	size(filePath) {
		return this.#deno
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
export class DenoHfs extends Hfs {
	/**
	 * Creates a new instance.
	 * @param {object} [options] The options for the instance.
	 * @param {Deno} [options.deno] The Deno module to use.
	 */
	constructor({ deno } = {}) {
		super({ impl: new DenoHfsImpl({ deno }) });
	}
}

export const hfs = new DenoHfs();
