/**
 * @fileoverview The main file for the fsx package.
 * @author Nicholas C. Zakas
 */
/* global Buffer:readonly, clearTimeout:readonly, setTimeout:readonly */

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

//-----------------------------------------------------------------------------
// Constants
//-----------------------------------------------------------------------------

const MAX_TASK_TIMEOUT = 60000;
const MAX_TASK_DELAY = 100;
const RETRY_ERROR_CODES = new Set(["ENFILE", "EMFILE"]);

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/*
 * The following logic has been extracted from graceful-fs.
 *
 * The ISC License
 *
 * Copyright (c) 2011-2023 Isaac Z. Schlueter, Ben Noordhuis, and Contributors
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR
 * IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

/**
 * Checks if it is time to retry a task based on the timestamp and last attempt time.
 * @param {number} timestamp The timestamp of the task.
 * @param {number} lastAttempt The timestamp of the last attempt.
 * @returns {boolean} true if it is time to retry, false otherwise.
 */
function isTimeToRetry(timestamp, lastAttempt) {
	const timeSinceLastAttempt = Date.now() - lastAttempt;
	const timeSinceStart = Math.max(lastAttempt - timestamp, 1);
	const desiredDelay = Math.min(timeSinceStart * 1.2, MAX_TASK_DELAY);

	return timeSinceLastAttempt >= desiredDelay;
}

/**
 * Checks if it is time to bail out based on the given timestamp.
 * @param {number} timestamp The timestamp to compare against.
 * @returns {boolean} true if it is time to bail, false otherwise.
 */
function isTimeToBail(timestamp) {
	return Date.now() - timestamp > MAX_TASK_TIMEOUT;
}

/**
 * A class that manages a queue of retry jobs.
 */
class Retrier {
	/**
	 * Represents the queue for processing tasks.
	 * @type {Array<object>}
	 */
	#queue;

	/**
	 * The timeout for the queue.
	 * @type {number}
	 */
	#timeout;

	/**
	 * The setTimeout() timer ID.
	 * @type {NodeJS.Timeout|undefined}
	 */
	#timerId;

	/**
	 * The function to call.
	 * @type {Function}
	 */
	#check;

	/**
	 * Creates a new instance.
	 * @param {Function} check The function to call.
	 * @param {object} [options] The options for the instance.
	 * @param {number} [options.timeout] The timeout for the queue.
	 */
	constructor(check, { timeout = 60000 } = {}) {
		this.#queue = [];
		this.#timeout = timeout;
		this.#check = check;
	}

	/**
	 * Adds a new retry job to the queue.
	 * @param {Function} fn The function to call.
	 * @returns {Promise<any>} A promise that resolves when the queue is
	 *  processed.
	 */
	retry(fn) {
		// call the original function and catch any ENFILE or EMFILE errors
		return fn().catch(error => {
			if (!this.#check(error)) {
				throw error;
			}

			return new Promise((resolve, reject) => {
				this.#queue.push({
					fn,
					error,
					timestamp: Date.now(),
					lastAttempt: Date.now(),
					resolve,
					reject,
				});
				this.#processQueue();
			});
		});
	}

	/**
	 * Processes the queue.
	 * @returns {void}
	 */
	#processQueue() {
		// clear any timer because we're going to check right now
		clearTimeout(this.#timerId);
		this.#timerId = undefined;

		// if there's nothing in the queue, we're done
		if (this.#queue.length === 0) {
			return;
		}

		const task = this.#queue.shift();

		// if it's time to bail, then bail
		if (isTimeToBail(task.timestamp)) {
			task.reject(task.error);
			this.#processQueue();
			return;
		}

		// if it's not time to retry, then wait and try again
		if (!isTimeToRetry(task.timestamp, task.lastAttempt)) {
			this.#queue.unshift(task);
			this.#timerId = setTimeout(() => this.#processQueue(), 0);
			return;
		}

		// otherwise, try again
		task.lastAttempt = Date.now();
		task.fn()
			.then(result => task.resolve(result))
			.catch(error => {
				if (!this.#check(error)) {
					task.reject(error);
				}

				// update the task timestamp and push to back of queue to try again
				task.lastAttempt = Date.now();
				this.#queue.push(task);
			})
			.finally(() => this.#processQueue());
	}
}

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
	 */
	arrayBuffer(filePath) {
		return this.#retrier
			.retry(() => this.#fsp.readFile(filePath))
			.then(buffer => buffer.buffer)
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
