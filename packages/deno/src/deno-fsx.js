/**
 * @fileoverview The main file for the deno-fsx package.
 * @author Nicholas C. Zakas
 */
/* global Deno:readonly */

//-----------------------------------------------------------------------------
// Types
//-----------------------------------------------------------------------------

/** @typedef{import("@fsx/types").FsxImpl} FsxImpl */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { Fsx } from "@fsx/core";
import * as path from "https://deno.land/std/path/mod.ts";

//-----------------------------------------------------------------------------
// Exports
//-----------------------------------------------------------------------------

/**
 * A class representing the Node.js implementation of Fsx.
 * @implements {FsxImpl}
 */
export class DenoFsxImpl {
	/**
	 * The file system module to use.
	 * @type {object}
	 */
	#deno;

	/**
	 * Creates a new instance.
	 * @param {object} [options] The options for the instance.
	 * @param {Deno} [options.deno] The Deno object to use.
	 */
	constructor({ deno = Deno } = {}) {
		this.#deno = deno;
	}

	/**
	 * Reads a file and returns the contents as a string.
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
		return this.#deno.readTextFile(filePath).catch(error => {
			if (error.code === "ENOENT") {
				return undefined;
			} else {
				throw error;
			}
		});
	}

	/**
	 * Reads a file and returns the contents as a JSON object.
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
	 * @returns {Promise<ArrayBuffer>} A promise that resolves with the contents
	 *    of the file.
	 * @throws {Error} If the file cannot be read.
	 * @throws {TypeError} If the file path is not a string.
	 */
	arrayBuffer(filePath) {
		return this.#deno
			.readFile(filePath)
			.then(bytes => bytes.buffer)
			.catch(error => {
				if (error.code === "ENOENT") {
					return undefined;
				} else {
					throw error;
				}
			});
	}

	/**
	 * Writes a value to a file, creating any necessary directories along the way.
	 * @param {string} filePath The path to the file to write.
	 * @param {string|ArrayBuffer} contents The contents to write to the
	 *   file.
	 * @returns {Promise<void>} A promise that resolves when the file is
	 *  written.
	 * @throws {TypeError} If the file path is not a string.
	 * @throws {Error} If the file cannot be written.
	 */
	async write(filePath, contents) {
		if (
			typeof contents !== "string" &&
			!(contents instanceof ArrayBuffer)
		) {
			throw new TypeError(
				"Invalid contents type. Expected string or ArrayBuffer.",
			);
		}

		const op =
			typeof contents === "string"
				? () =>
						this.#deno.writeTextFile(filePath, contents, {
							create: true,
						})
				: () =>
						this.#deno.writeFile(
							filePath,
							new Uint8Array(contents),
							{
								create: true,
							},
						);

		return op().catch(error => {
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
	 * @throws {TypeError} If the file path is not a string.
	 */
	isFile(filePath) {
		return this.#deno
			.stat(filePath)
			.then(stat => stat.isFile)
			.catch(() => false);
	}

	/**
	 * Checks if a directory exists.
	 * @param {string} dirPath The path to the directory to check.
	 * @returns {Promise<boolean>} A promise that resolves with true if the
	 *    directory exists or false if it does not.
	 * @throws {TypeError} If the directory path is not a string.
	 */
	isDirectory(dirPath) {
		return this.#deno
			.stat(dirPath)
			.then(stat => stat.isDirectory)
			.catch(() => false);
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
		return this.#deno.remove(fileOrDirPath, { recursive: true });
	}
}

/**
 * A class representing a file system utility library.
 * @implements {FsxImpl}
 */
export class DenoFsx extends Fsx {
	/**
	 * Creates a new instance.
	 * @param {object} [options] The options for the instance.
	 * @param {Deno} [options.deno] The Deno module to use.
	 */
	constructor({ deno } = {}) {
		super({ impl: new DenoFsxImpl({ deno }) });
	}
}

export const fsx = new DenoFsx();
