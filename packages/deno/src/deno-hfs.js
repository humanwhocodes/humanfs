/**
 * @fileoverview The main file for the deno-hfs package.
 * @author Nicholas C. Zakas
 */
/* global Deno:readonly, URL */

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
import { fileURLToPath } from "node:url";

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
	 * Reads a file and returns the contents as an Uint8Array.
	 * @param {string|URL} filePath The path to the file to read.
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
				const dirPath = path.dirname(
					filePath instanceof URL
						? fileURLToPath(filePath)
						: filePath,
				);

				return this.#deno.mkdir(dirPath, { recursive: true }).then(op);
			}

			throw error;
		});
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
							append: true,
						})
				: () =>
						this.#deno.writeFile(filePath, new Uint8Array(value), {
							append: true,
						});

		return this.#retrier.retry(op).catch(error => {
			if (error.code === "ENOENT") {
				const dirPath = path.dirname(
					filePath instanceof URL
						? fileURLToPath(filePath)
						: filePath,
				);

				return this.#deno.mkdir(dirPath, { recursive: true }).then(op);
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
	 * @param {string|URL} dirPath The path to the directory to check.
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
	 * @param {string|URL} dirPath The path to the directory to create.
	 * @returns {Promise<void>} A promise that resolves when the directory is
	 *   created.
	 */
	async createDirectory(dirPath) {
		await this.#deno.mkdir(dirPath, { recursive: true });
	}

	/**
	 * Deletes a file or empty directory.
	 * @param {string|URL} filePath The path to the file or directory to
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
	 * @param {string|URL} filePath The path to the file or directory to
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
	 * @param {string|URL} dirPath The path to the directory to list.
	 * @returns {AsyncIterable<HfsDirectoryEntry>} An async iterator
	 *  that yields the files and directories in the directory.
	 */
	async *list(dirPath) {
		yield* this.#deno.readDir(dirPath);
	}

	/**
	 * Returns the size of a file.
	 * @param {string|URL} filePath The path to the file to read.
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

	/**
	 * Returns the last modified date of a file or directory. This method handles ENOENT errors
	 * and returns undefined in that case.
	 * @param {string|URL} fileOrDirPath The path to the file to read.
	 * @returns {Promise<Date|undefined>} A promise that resolves with the last modified
	 * date of the file or directory, or undefined if the file doesn't exist.
	 */
	lastModified(fileOrDirPath) {
		return this.#deno
			.stat(fileOrDirPath)
			.then(stat => stat.mtime)
			.catch(error => {
				if (error.code === "ENOENT") {
					return undefined;
				}

				throw error;
			});
	}

	/**
	 * Copies a file from one location to another.
	 * @param {string|URL} source The path to the file to copy.
	 * @param {string|URL} destination The path to the destination file.
	 * @returns {Promise<void>} A promise that resolves when the file is copied.
	 * @throws {Error} If the source file does not exist.
	 * @throws {Error} If the source file is a directory.
	 * @throws {Error} If the destination file is a directory.
	 */
	copy(source, destination) {
		return this.#deno.copyFile(source, destination);
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

		const sourceStr =
			source instanceof URL ? fileURLToPath(source) : source;

		const destinationStr =
			destination instanceof URL
				? fileURLToPath(destination)
				: destination;

		// for directories, create the destination directory and copy each entry
		await this.createDirectory(destination);

		for await (const entry of this.list(source)) {
			const fromEntryPath = path.join(sourceStr, entry.name);
			const toEntryPath = path.join(destinationStr, entry.name);

			if (entry.isDirectory) {
				await this.copyAll(fromEntryPath, toEntryPath);
			} else {
				await this.copy(fromEntryPath, toEntryPath);
			}
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
	move(source, destination) {
		return this.#deno.stat(source).then(stat => {
			if (stat.isDirectory) {
				throw new Error(
					`EISDIR: illegal operation on a directory, move '${source}' -> '${destination}'`,
				);
			}

			return this.#deno.rename(source, destination);
		});
	}

	/**
	 * Moves a file or directory from one location to another.
	 * @param {string|URL} source The path to the file or directory to move.
	 * @param {string|URL} destination The path to move the file or directory to.
	 * @returns {Promise<void>} A promise that resolves when the file or directory is
	 * moved.
	 * @throws {Error} If the source file or directory does not exist.
	 */
	moveAll(source, destination) {
		return this.#deno.rename(source, destination);
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
