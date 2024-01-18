/**
 * @fileoverview The main file for the fsx package.
 * @author Nicholas C. Zakas
 */
/* global Buffer:readonly */

//-----------------------------------------------------------------------------
// Types
//-----------------------------------------------------------------------------

/** @typedef{import("fsx-types").FsxImpl} FsxImpl */
/** @typedef{import("node:fs/promises")} Fsp */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { Fsx } from "fsx-core";
import path from "node:path";
import { Retrier } from "@humanwhocodes/retry";

//-----------------------------------------------------------------------------
// Constants
//-----------------------------------------------------------------------------

const RETRY_ERROR_CODES = new Set(["ENFILE", "EMFILE"]);

//-----------------------------------------------------------------------------
// Exports
//-----------------------------------------------------------------------------

/**
 * A class representing the Node.js implementation of Fsx.
 * @implements {FsxImpl}
 */
export class NodeFsxImpl {
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
	 * @param {object} options The options for the instance.
	 * @param {Fsp} options.fsp The file system module to use.
	 */
	constructor({ fsp }) {
		this.#fsp = fsp;
		this.#retrier = new Retrier(error => RETRY_ERROR_CODES.has(error.code));
	}

	/**
	 * Reads a file and returns the contents as a string. Assumes UTF-8 encoding.
	 * @param {string} filePath The path to the file to read.
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
	 * @param {string} filePath The path to the file to read.
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
	 * @param {string} filePath The path to the file to read.
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
	 * @param {string} filePath The path to the file to read.
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
	 * @param {string} filePath The path to the file to write.
	 * @param {string|ArrayBuffer} contents The contents to write to the
	 *   file.
	 * @returns {Promise<void>} A promise that resolves when the file is
	 *  written.
	 * @throws {TypeError} If the file path is not a string.
	 * @throws {Error} If the file cannot be written.
	 */
	async write(filePath, contents) {
		const value =
			contents instanceof ArrayBuffer ? Buffer.from(contents) : contents;

		return this.#retrier
			.retry(() => this.#fsp.writeFile(filePath, value))
			.catch(error => {
				// the directory may not exist, so create it
				if (error.code === "ENOENT") {
					return this.#fsp
						.mkdir(path.dirname(filePath), { recursive: true })
						.then(() => this.#fsp.writeFile(filePath, value));
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
	 * @param {string} dirPath The path to the directory to check.
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
	 * @param {string} dirPath The path to the directory to create.
	 * @returns {Promise<void>} A promise that resolves when the directory is
	 *   created.
	 */
	async createDirectory(dirPath) {
		await this.#fsp.mkdir(dirPath, { recursive: true });
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
	delete(fileOrDirPath) {
		return this.#fsp.rm(fileOrDirPath, { recursive: true });
	}
}

/**
 * A class representing a file system utility library.
 * @implements {FsxImpl}
 */
export class NodeFsx extends Fsx {
	/**
	 * Creates a new instance.
	 * @param {object} [options] The options for the instance.
	 * @param {Fsp} [options.fsp] The file system module to use.
	 */
	constructor({ fsp } = {}) {
		super({ impl: new NodeFsxImpl({ fsp }) });
	}
}

export const fsx = new NodeFsx();
