/**
 * @fileoverview The main file for the hfs package.
 * @author Nicholas C. Zakas
 */
/* global TextEncoder, URL */

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
 * Checks if a value is an ArrayBuffer.
 * @param {any} value The value to check.
 * @returns {void}
 * @throws {TypeError} If the value is not an ArrayBuffer.
 */
function assertArrayBuffer(value) {
	if (!(value instanceof ArrayBuffer)) {
		throw new TypeError("Value must be an ArrayBuffer.");
	}
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

	while (object.get(key)) {
		if (parts.length === 0) {
			return { object, key };
		}

		object = object.get(key);
		key = parts.shift();
	}

	return undefined;
}

/**
 * Finds a file or directory in the volume.
 * @param {MemoryHfsDirectory} volume The volume to search.
 * @param {string|URL} fileOrDirPath The path to the file or directory to find.
 * @returns {MemoryHfsDirectory|MemoryHfsFile|undefined} The file or directory found.
 */
function readPath(volume, fileOrDirPath) {
	const location = findPath(volume, fileOrDirPath);

	if (!location) {
		return undefined;
	}

	const { object, key } = location;
	return object.get(key);
}

/**
 * Writes a file or directory to the volume.
 * @param {MemoryHfsDirectory} volume The volume to search.
 * @param {string|URL} fileOrDirPath The path to the file or directory to find.
 * @param {MemoryHfsDirectory|MemoryHfsFile|undefined} value The value to write.
 * @returns {void}
 */
function writePath(volume, fileOrDirPath, value) {
	const path =
		fileOrDirPath instanceof URL
			? Path.fromURL(fileOrDirPath)
			: Path.fromString(fileOrDirPath);
	const name = path.pop();
	let directory = volume;

	// create any missing directories
	for (const step of path) {
		let entry = directory.get(step);

		if (!entry) {
			entry = new MemoryHfsDirectory();
			directory.set(step, entry);
		}

		directory = entry;
	}

	// we don't want to overwrite an existing directory
	if (
		directory &&
		directory.get("name")?.kind === "directory" &&
		value.kind === "directory"
	) {
		return;
	}

	directory.set(name, value);
}

//-----------------------------------------------------------------------------
// Utility Classes
//-----------------------------------------------------------------------------

/**
 * A class representing a file in memory.
 */
class MemoryHfsFile {
	/**
	 * The contents of the file.
	 * @type {ArrayBuffer}
	 */
	#contents;

	/**
	 * The last modified date of the file.
	 * @type {Date}
	 */
	lastModified = new Date();

	/**
	 * The kind of file system object.
	 * @type {string}
	 * @readonly
	 */
	kind = "file";

	/**
	 * The parent directory of the file.
	 * @type {MemoryHfsDirectory|undefined}
	 */
	parent;

	/**
	 * Creates a new instance.
	 * @param {ArrayBuffer} contents The contents of the file.
	 * @throws {TypeError} If the contents are not an ArrayBuffer.
	 */
	constructor(contents) {
		assertArrayBuffer(contents);
		this.#contents = contents;
	}

	/**
	 * Gets the contents of the file.
	 * @type {ArrayBuffer}
	 */
	get contents() {
		return this.#contents;
	}

	/**
	 * Sets the contents of the file.
	 * @param {ArrayBuffer} value The new contents of the file.
	 * @throws {TypeError} If the contents are not an ArrayBuffer.
	 * @returns {void}
	 */
	set contents(value) {
		assertArrayBuffer(value);
		this.#contents = value;
		this.lastModified = new Date();

		// now update each ancestor's last modified date
		let current = this.parent;

		while (current) {
			current.lastModified = this.lastModified;
			current = current.parent;
		}
	}
}

export class MemoryHfsDirectory extends Map {
	/**
	 * The last modified date of the directory.
	 * @type {Date}
	 */
	lastModified = new Date();

	/**
	 * The kind of file system object.
	 * @type {string}
	 * @readonly
	 */
	kind = "directory";

	/**
	 * The parent directory of the directory.
	 * @type {MemoryHfsDirectory|undefined}
	 */
	parent;

	/**
	 * Sets a value in the directory.
	 * @param {string} key The key to set.
	 * @param {MemoryHfsFile|MemoryHfsDirectory} entry The value to set.
	 * @returns {this} The instance for chaining.
	 */
	set(key, entry) {
		entry.lastModified = new Date();
		entry.parent = this;
		return super.set(key, entry);
	}

	/**
	 * Deletes a value from the directory.
	 * @param {string} key The key to delete.
	 * @returns {boolean} True if the key was deleted, false if not.
	 */
	delete(key) {
		this.lastModified = new Date();

		if (this.has(key)) {
			const entry = this.get(key);

			if (entry.kind === "directory") {
				entry.parent = undefined;
			}

			return super.delete(key);
		}

		return false;
	}
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
	 * @type {MemoryHfsDirectory}
	 */
	#root = new MemoryHfsDirectory();

	/**
	 * Reads a file and returns the contents as an Uint8Array.
	 * @param {string|URL} filePath The path to the file to read.
	 * @returns {Promise<Uint8Array|undefined>} A promise that resolves with the contents
	 *    of the file or undefined if the file does not exist.
	 * @throws {Error} If the file cannot be read.
	 * @throws {TypeError} If the file path is not a string.
	 */
	async bytes(filePath) {
		const entry = readPath(this.#root, filePath);

		if (entry?.kind !== "file") {
			return undefined;
		}

		const file = /** @type {MemoryHfsFile} */ (entry);
		return file.contents ? new Uint8Array(file.contents) : undefined;
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
			value = new TextEncoder().encode(contents).buffer;
		} else if (contents instanceof ArrayBuffer) {
			value = contents;
		} else if (ArrayBuffer.isView(contents)) {
			value = contents.buffer.slice(
				contents.byteOffset,
				contents.byteOffset + contents.byteLength,
			);
		}

		return writePath(this.#root, filePath, new MemoryHfsFile(value));
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
		const existing = /** @type {MemoryHfsFile} */ (
			readPath(this.#root, filePath)
		);

		if (!existing) {
			return this.write(filePath, contents);
		}

		const valueToAppend =
			typeof contents === "string"
				? new TextEncoder().encode(contents).buffer
				: ArrayBuffer.isView(contents)
					? contents.buffer.slice(
							contents.byteOffset,
							contents.byteOffset + contents.byteLength,
						)
					: contents;

		const newValue = new Uint8Array([
			...new Uint8Array(existing.contents),
			...new Uint8Array(valueToAppend),
		]).buffer;

		existing.contents = newValue;
	}

	/**
	 * Checks if a file exists.
	 * @param {string|URL} filePath The path to the file to check.
	 * @returns {Promise<boolean>} A promise that resolves with true if the
	 *    file exists or false if it does not.
	 * @throws {TypeError} If the file path is not a string.
	 */
	async isFile(filePath) {
		const location = findPath(this.#root, filePath);

		if (!location) {
			return false;
		}

		const { object, key } = location;

		return object.get(key).kind === "file";
	}

	/**
	 * Checks if a directory exists.
	 * @param {string|URL} dirPath The path to the directory to check.
	 * @returns {Promise<boolean>} A promise that resolves with true if the
	 *    directory exists or false if it does not.
	 * @throws {TypeError} If the directory path is not a string.
	 */
	async isDirectory(dirPath) {
		const location = findPath(this.#root, dirPath);

		if (!location) {
			return false;
		}

		const { object, key } = location;
		return object.get(key).kind === "directory";
	}

	/**
	 * Creates a directory recursively.
	 * @param {string|URL} dirPath The path to the directory to create.
	 * @returns {Promise<void>} A promise that resolves when the directory is
	 *   created.
	 */
	async createDirectory(dirPath) {
		writePath(this.#root, dirPath, new MemoryHfsDirectory());
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
		const location = findPath(this.#root, fileOrDirPath);

		if (!location) {
			throw new Error(
				`ENOENT: no such file or directory, unlink '${fileOrDirPath}'`,
			);
		}

		const { object, key } = location;

		const entry = object.get(key);

		if (entry.kind === "directory" && entry.size > 0) {
			throw new Error(
				`ENOTEMPTY: directory not empty, rmdir '${fileOrDirPath}'`,
			);
		}

		object.delete(key);
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
		const location = findPath(this.#root, fileOrDirPath);

		if (!location) {
			throw new Error(
				`ENOENT: no such file or directory, unlink '${fileOrDirPath}'`,
			);
		}

		const { object, key } = location;

		object.delete(key);
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
			target = this.#root;
		} else {
			const location = findPath(this.#root, dirPath);

			if (!location) {
				throw new Error(
					`ENOENT: no such file or directory, list '${dirPath}'`,
				);
			}

			const { object, key } = location;
			target = object.get(key);
		}

		for (const [name, value] of target.entries()) {
			yield {
				name,
				isDirectory: value.kind === "directory",
				isFile: value.kind === "file",
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
		const entry = readPath(this.#root, filePath);

		if (entry?.kind !== "file") {
			return undefined;
		}

		return /** @type {MemoryHfsFile} */ (entry).contents.byteLength;
	}

	/**
	 * Returns the last modified date of a file or directory. This method handles ENOENT errors
	 * and returns undefined in that case.
	 * @param {string|URL} fileOrDirPath The path to the file to read.
	 * @returns {Promise<Date|undefined>} A promise that resolves with the last modified
	 * date of the file or directory, or undefined if the file doesn't exist.
	 */
	async lastModified(fileOrDirPath) {
		const entry = readPath(this.#root, fileOrDirPath);

		if (!entry) {
			return undefined;
		}

		return entry.lastModified;
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
		const entry = readPath(this.#root, source);

		if (!entry) {
			throw new Error(
				`ENOENT: no such file, copy '${source}' -> '${destination}'`,
			);
		}

		if (entry.kind !== "file") {
			throw new Error(
				`EISDIR: illegal operation on a directory, copy '${source}' -> '${destination}'`,
			);
		}

		if (await this.isDirectory(destination)) {
			throw new Error(
				`EISDIR: illegal operation on a directory, copy '${source}' -> '${destination}'`,
			);
		}

		const file = /** @type {MemoryHfsFile} */ (entry);

		writePath(this.#root, destination, new MemoryHfsFile(file.contents));
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

		// if the source isn't a directory then throw an error
		if (!(await this.isDirectory(source))) {
			throw new Error(
				`ENOENT: no such file or directory, copy '${source}' -> '${destination}'`,
			);
		}

		const sourcePath =
			source instanceof URL
				? Path.fromURL(source)
				: Path.fromString(source);

		const destinationPath =
			destination instanceof URL
				? Path.fromURL(destination)
				: Path.fromString(destination);

		// for directories, create the destination directory and copy each entry
		await this.createDirectory(destination);

		for await (const entry of this.list(source)) {
			destinationPath.push(entry.name);
			sourcePath.push(entry.name);

			if (entry.isDirectory) {
				await this.copyAll(
					sourcePath.toString(),
					destinationPath.toString(),
				);
			} else {
				await this.copy(
					sourcePath.toString(),
					destinationPath.toString(),
				);
			}

			destinationPath.pop();
			sourcePath.pop();
		}
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
		const entry = readPath(this.#root, source);

		if (!entry) {
			throw new Error(
				`ENOENT: no such file or directory, move '${source}' -> '${destination}'`,
			);
		}

		if (entry.kind !== "file") {
			throw new Error(
				`EISDIR: illegal operation on a directory, move '${source}' -> '${destination}'`,
			);
		}

		writePath(this.#root, destination, entry);

		this.delete(source);
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
		// for files use move() and exit
		if (await this.isFile(source)) {
			return this.move(source, destination);
		}

		// if the source isn't a directory then throw an error
		if (!(await this.isDirectory(source))) {
			throw new Error(
				`ENOENT: no such file or directory, moveAll '${source}' -> '${destination}'`,
			);
		}

		const sourcePath =
			source instanceof URL
				? Path.fromURL(source)
				: Path.fromString(source);

		const destinationPath =
			destination instanceof URL
				? Path.fromURL(destination)
				: Path.fromString(destination);

		// for directories, create the destination directory and copy each entry
		await this.createDirectory(destination);

		for await (const entry of this.list(source)) {
			destinationPath.push(entry.name);
			sourcePath.push(entry.name);

			if (entry.isDirectory) {
				await this.moveAll(
					sourcePath.toString(),
					destinationPath.toString(),
				);
			} else {
				await this.move(
					sourcePath.toString(),
					destinationPath.toString(),
				);
			}

			destinationPath.pop();
			sourcePath.pop();
		}

		this.delete(source);
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
