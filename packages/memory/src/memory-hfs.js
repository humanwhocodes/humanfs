/**
 * @fileoverview The main file for the hfs package.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Types
//-----------------------------------------------------------------------------

/** @typedef {import("@humanfs/types").HfsImpl} HfsImpl */
/** @typedef {import("@humanfs/types").HfsDirectoryEntry} HfsDirectoryEntry */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import {
	Hfs,
	NotFoundError,
	DirectoryError,
	NotEmptyError,
} from "@humanfs/core";

import { MemoryHfsVolume } from "./memory-hfs-volume.js";

//-----------------------------------------------------------------------------
// Exports
//-----------------------------------------------------------------------------

/**
 * A class representing the in-memory implementation of Hfs.
 * @implements {HfsImpl}
 */
export class MemoryHfsImpl {
	/**
	 * The in-memory file system volume to use.
	 * @type {MemoryHfsVolume}
	 */
	#volume = new MemoryHfsVolume();

	/**
	 * Reads a file and returns the contents as an Uint8Array.
	 * @param {string|URL} filePath The path to the file to read.
	 * @returns {Promise<Uint8Array|undefined>} A promise that resolves with the contents
	 *    of the file or undefined if the file does not exist.
	 * @throws {Error} If the file cannot be read.
	 * @throws {TypeError} If the file path is not a string.
	 */
	async bytes(filePath) {
		const contents = this.#volume.readFile(filePath);

		if (contents === undefined) {
			return undefined;
		}

		return new Uint8Array(contents);
	}

	/**
	 * Writes a value to a file. If the value is a string, UTF-8 encoding is used.
	 * @param {string|URL} filePath The path to the file to write.
	 * @param {Uint8Array} contents The contents to write to the
	 *   file.
	 * @returns {Promise<void>} A promise that resolves when the file is
	 *  written.
	 * @throws {TypeError} If the file path is not a string.
	 * @throws {Error} If the file cannot be written.
	 */
	async write(filePath, contents) {
		const value = contents.buffer.slice(
			contents.byteOffset,
			contents.byteOffset + contents.byteLength,
		);

		this.#volume.writeFile(filePath, value);
	}

	/**
	 * Appends a value to a file. If the value is a string, UTF-8 encoding is used.
	 * @param {string|URL} filePath The path to the file to append to.
	 * @param {Uint8Array} contents The contents to append to the
	 *  file.
	 * @returns {Promise<void>} A promise that resolves when the file is
	 * written.
	 * @throws {TypeError} If the file path is not a string.
	 * @throws {Error} If the file cannot be appended to.
	 */
	async append(filePath, contents) {
		const existing = this.#volume.readFile(filePath);
		if (!existing) {
			const value = contents.buffer.slice(
				contents.byteOffset,
				contents.byteOffset + contents.byteLength,
			);

			return this.#volume.writeFile(filePath, value);
		}

		const newValue = new Uint8Array([
			...new Uint8Array(existing),
			...contents,
		]).buffer;

		this.#volume.writeFile(filePath, newValue);
	}

	/**
	 * Checks if a file exists.
	 * @param {string|URL} filePath The path to the file to check.
	 * @returns {Promise<boolean>} A promise that resolves with true if the
	 *    file exists or false if it does not.
	 * @throws {TypeError} If the file path is not a string.
	 */
	async isFile(filePath) {
		const entry = this.#volume.stat(filePath);

		if (!entry) {
			return false;
		}

		return entry.kind === "file";
	}

	/**
	 * Checks if a directory exists.
	 * @param {string|URL} dirPath The path to the directory to check.
	 * @returns {Promise<boolean>} A promise that resolves with true if the
	 *    directory exists or false if it does not.
	 * @throws {TypeError} If the directory path is not a string.
	 */
	async isDirectory(dirPath) {
		const entry = this.#volume.stat(dirPath);

		if (!entry) {
			return false;
		}

		return entry.kind === "directory";
	}

	/**
	 * Creates a directory recursively.
	 * @param {string|URL} dirPath The path to the directory to create.
	 * @returns {Promise<void>} A promise that resolves when the directory is
	 *   created.
	 */
	async createDirectory(dirPath) {
		this.#volume.mkdirp(dirPath);
	}

	/**
	 * Deletes a file or empty directory.
	 * @param {string|URL} fileOrDirPath The path to the file or directory to
	 *   delete.
	 * @returns {Promise<boolean>} A promise that resolves when the file or
	 *   directory is deleted, true if the file or directory is deleted, false
	 *   if the file or directory does not exist.
	 * @throws {TypeError} If the file or directory path is not a string.
	 * @throws {Error} If the file or directory cannot be deleted.
	 */
	async delete(fileOrDirPath) {
		const entry = this.#volume.stat(fileOrDirPath);

		if (!entry) {
			return false;
		}

		// if the entry is directory, check to see if its empty with readDir
		if (entry.kind === "directory") {
			const entries = this.#volume.readdir(fileOrDirPath);

			if (entries.length > 0) {
				throw new NotEmptyError(`delete '${fileOrDirPath}'`);
			}
		}

		this.#volume.rm(fileOrDirPath);
		return true;
	}

	/**
	 * Deletes a file or directory recursively.
	 * @param {string|URL} fileOrDirPath The path to the file or directory to
	 *   delete.
	 * @returns {Promise<boolean>} A promise that resolves when the file or
	 *   directory is deleted, true if the file or directory is deleted, false
	 *   if the file or directory does not exist.
	 * @throws {TypeError} If the file or directory path is not a string.
	 * @throws {Error} If the file or directory cannot be deleted.
	 */
	async deleteAll(fileOrDirPath) {
		const entry = this.#volume.stat(fileOrDirPath);

		if (!entry) {
			return false;
		}

		this.#volume.rm(fileOrDirPath);
		return true;
	}

	/**
	 * Returns a list of directory entries for the given path.
	 * @param {string|URL} dirPath The path to the directory to read.
	 * @returns {AsyncIterable<HfsDirectoryEntry>} A promise that resolves with the
	 *   directory entries.
	 */
	async *list(dirPath) {
		const entries = this.#volume.readdir(dirPath);

		for (const entry of entries) {
			yield entry;
		}
	}

	/**
	 * Returns the size of a file.
	 * @param {string|URL} filePath The path to the file to read.
	 * @returns {Promise<number|undefined>} A promise that resolves with the size of the
	 *  file in bytes or undefined if the file doesn't exist.
	 */
	async size(filePath) {
		const entry = this.#volume.stat(filePath);

		if (!entry) {
			return undefined;
		}

		return entry.size;
	}

	/**
	 * Returns the last modified date of a file or directory. This method handles ENOENT errors
	 * and returns undefined in that case.
	 * @param {string|URL} fileOrDirPath The path to the file to read.
	 * @returns {Promise<Date|undefined>} A promise that resolves with the last modified
	 * date of the file or directory, or undefined if the file doesn't exist.
	 */
	async lastModified(fileOrDirPath) {
		const entry = this.#volume.stat(fileOrDirPath);

		if (!entry) {
			return undefined;
		}

		return entry.mtime;
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
	async copy(source, destination) {
		const entry = this.#volume.stat(source);

		if (!entry) {
			throw new NotFoundError(`copy '${source}' -> '${destination}'`);
		}

		if (entry.kind !== "file") {
			throw new DirectoryError(`copy '${source}' -> '${destination}'`);
		}

		this.#volume.cp(source, destination);
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
		this.#volume.cp(source, destination);
	}

	/**
	/**
	 * Moves a file from the source path to the destination path.
	 * @param {string|URL} source The location of the file to move.
	 * @param {string|URL} destination The destination of the file to move.
	 * @returns {Promise<void>} A promise that resolves when the move is complete.
	 * @throws {TypeError} If the file paths are not strings.
	 * @throws {Error} If the file cannot be moved.
	 */
	async move(source, destination) {
		const entry = this.#volume.stat(source);

		if (!entry) {
			throw new NotFoundError(`move '${source}' -> '${destination}'`);
		}

		if (entry.kind !== "file") {
			throw new DirectoryError(`move '${source}' -> '${destination}'`);
		}

		this.#volume.mv(source, destination);
	}

	/**
	 * Moves a file or directory from one location to another.
	 * @param {string|URL} source The path to the file or directory to move.
	 * @param {string|URL} destination The path to move the file or directory to.
	 * @returns {Promise<void>} A promise that resolves when the file or directory is
	 * moved.
	 * @throws {Error} If the source file or directory does not exist.
	 * @throws {Error} If the file or directory cannot be moved.
	 */
	async moveAll(source, destination) {
		this.#volume.mv(source, destination);
	}
}

/**
 * A class representing a file system utility library.
 * @implements {HfsImpl}
 */
export class MemoryHfs extends Hfs {
	/**
	 * Creates a new instance.
	 */
	constructor() {
		super({ impl: new MemoryHfsImpl() });
	}
}

export const hfs = new MemoryHfs();
