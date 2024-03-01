/**
 * @fileoverview The internals of the MemoryHfsImpl.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { Path, NotFoundError, DirectoryError } from "@humanfs/core";

//-----------------------------------------------------------------------------
// Data
//-----------------------------------------------------------------------------

let objectId = 0;
const parents = new WeakMap();

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
 * @param {MemoryHfsDirectory} root The volume to search.
 * @param {Path} fileOrDirPath The path to the file or directory to find.
 * @returns {MemoryHfsDirectory|MemoryHfsFile|undefined} The file or directory found.
 */
function findPath(root, fileOrDirPath) {
	const parts = [...fileOrDirPath];

	if (parts.length === 0) {
		return root;
	}

	let object = root;
	let key = parts.shift();

	while (object.get(key)) {
		if (parts.length === 0) {
			return object.get(key);
		}

		object = object.get(key);
		key = parts.shift();
	}

	return undefined;
}

/**
 * Writes a file or directory to the volume.
 * @param {MemoryHfsDirectory} volume The volume to search.
 * @param {string|URL} fileOrDirPath The path to the file or directory to find.
 * @param {MemoryHfsDirectory|MemoryHfsFile|undefined} value The value to write.
 * @returns {Array<MemoryHfsDirectory|MemoryHfsFile>} The files and directories created,
 *    including `value`, or undefined if the directory already exists.
 */
function writePath(volume, fileOrDirPath, value) {
	const path = Path.from(fileOrDirPath);
	const name = path.pop();
	let directory = volume;
	const created = [];

	// create any missing directories
	for (const step of path) {
		let entry = directory.get(step);

		if (!entry) {
			entry = new MemoryHfsDirectory();
			directory.set(step, entry);
			created.push(entry);
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
	created.push(value);

	return created;
}

//-----------------------------------------------------------------------------
// Utility Classes
//-----------------------------------------------------------------------------

/**
 * A class representing a file in memory.
 */
export class MemoryHfsFile {
	/**
	 * The unique identifier for the file.
	 * @type {string}
	 * @readonly
	 */
	#id = `file-${objectId++}`;

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
	 * Creates a new instance.
	 * @param {ArrayBuffer} contents The contents of the file.
	 * @throws {TypeError} If the contents are not an ArrayBuffer.
	 */
	constructor(contents) {
		assertArrayBuffer(contents);
		this.#contents = contents;
	}

	/**
	 * The unique identifier for the file.
	 * @type {string}
	 * @readonly
	 */
	get id() {
		return this.#id;
	}

	/**
	 * Gets the contents of the file.
	 * @type {ArrayBuffer}
	 */
	get contents() {
		return this.#contents;
	}

	/**
	 * The parent directory of the file.
	 * @type {MemoryHfsDirectory|undefined}
	 * @readonly
	 */
	get parent() {
		return parents.get(this);
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

	/**
	 * Creates a copy of the file.
	 * @returns {MemoryHfsFile} The new file.
	 */
	clone() {
		return new MemoryHfsFile(this.#contents.slice(0));
	}
}

/**
 * A class representing a directory in memory.
 * It extends Map to provide the functionality of a directory.
 */
export class MemoryHfsDirectory extends Map {
	/**
	 * The unique identifier for the directory.
	 * @type {string}
	 * @readonly
	 */
	#id = `dir-${objectId++}`;

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
	 * The unique identifier for the file.
	 * @type {string}
	 * @readonly
	 */
	get id() {
		return this.#id;
	}

	/**
	 * The parent directory of the file.
	 * @type {MemoryHfsDirectory|undefined}
	 * @readonly
	 */
	get parent() {
		return parents.get(this);
	}

	/**
	 * Sets a value in the directory.
	 * @param {string} key The key to set.
	 * @param {MemoryHfsFile|MemoryHfsDirectory} entry The value to set.
	 * @returns {this} The instance for chaining.
	 */
	set(key, entry) {
		const existing = this.get(key);

		// if there's already an entry in this name then delete it from the tree
		if (existing) {
			parents.delete(existing);
		}

		entry.lastModified = new Date();
		parents.set(entry, this);
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
				parents.delete(entry);
			}

			return super.delete(key);
		}

		return false;
	}

	/**
	 * Creates a copy of the directory.
	 * @returns {MemoryHfsDirectory} The new directory.
	 */
	clone() {
		return new MemoryHfsDirectory(
			Array.from(this.entries()).map(([key, value]) => [
				key,
				value.clone(),
			]),
		);
	}
}

/**
 * A class representing a volume in memory.
 * It has methods that Node.js fs/promises module commands,
 * but operate on an in-memory file system. It also
 * has method that operate on IDs to make it easy to
 * mimic cloud-based file systems.
 */
export class MemoryHfsVolume {
	/**
	 * A map of object IDs to objects.
	 * @type {Map<string, MemoryHfsFile|MemoryHfsDirectory>}
	 */
	#objects = new Map();

	/**
	 * The root directory of the volume.
	 * @type {MemoryHfsDirectory}
	 */
	#root = new MemoryHfsDirectory();

	/**
	 * Retrieves an object by its ID.
	 * @param {string} id The ID of the object to retrieve.
	 * @returns {MemoryHfsFile|MemoryHfsDirectory|undefined} The object or undefined if not found.
	 * @throws {TypeError} If the ID is not a string.
	 */
	getObject(id) {
		if (typeof id !== "string") {
			throw new TypeError("ID must be a string.");
		}

		return this.#objects.get(id);
	}

	/**
	 * Reads the contents of a file.
	 * @param {string|URL} filePath The path to the file to read.
	 * @returns {ArrayBuffer|undefined} The contents of the file or undefined if not found.
	 */
	readFile(filePath) {
		const file = findPath(this.#root, Path.from(filePath));

		if (!file) {
			return undefined;
		}

		if (file.kind !== "file") {
			throw new DirectoryError(`readFile ${filePath}`);
		}

		return /** @type {MemoryHfsFile} */ (file).contents;
	}

	/**
	 * Writes the contents of a file.
	 * @param {string|URL} filePath The path to the file to write.
	 * @param {ArrayBuffer} contents The contents to write.
	 * @returns {void}
	 */
	writeFile(filePath, contents) {
		for (const entry of writePath(
			this.#root,
			filePath,
			new MemoryHfsFile(contents),
		)) {
			this.#objects.set(entry.id, entry);
		}
	}

	/**
	 * Copies a file or directory.
	 * @param {string|URL} source The path to the file or directory to copy.
	 * @param {string|URL} destination The path to copy the file or directory to.
	 * @returns {void}
	 * @throws {NotFoundError} If the source is not found.
	 * @throws {DirectoryError} If the destination is a directory and the source is a file.
	 */
	cp(source, destination) {
		const srcPath = Path.from(source);
		const object = findPath(this.#root, srcPath);

		if (!object) {
			throw new NotFoundError(`cp ${source} ${destination}`);
		}

		const destPath = Path.from(destination);
		const destObject = findPath(this.#root, destPath);

		// can't overwrite a directory with a file
		if (object.kind === "file" && destObject?.kind === "directory") {
			throw new DirectoryError(`cp ${source} ${destination}`);
		}

		// do the actual copying
		object.parent.set(destPath.name, object.clone());
	}

	/**
	 * Moves a file or directory.
	 * @param {string|URL} source The path to the file or directory to move.
	 * @param {string|URL} destination The path to move the file or directory to.
	 * @returns {void}
	 * @throws {NotFoundError} If the source is not found.
	 * @throws {DirectoryError} If the destination is a directory and the source is a file.
	 */
	mv(source, destination) {
		const srcPath = Path.from(source);
		const object = findPath(this.#root, srcPath);

		if (!object) {
			throw new NotFoundError(`mv ${source} ${destination}`);
		}

		const destPath = Path.from(destination);
		const destObject = findPath(this.#root, destPath);

		// can't overwrite a directory with a file
		if (object.kind === "file" && destObject?.kind === "directory") {
			throw new DirectoryError(`mv ${source} ${destination}`);
		}

		// do the actual moving
		const name = destPath.pop();
		const destDir = /** @type {MemoryHfsDirectory} */ (
			findPath(this.#root, destPath)
		);
		destDir.set(name, object.clone());

		// remove the original
		object.parent.delete(srcPath.name);
	}

	/**
	 * Retrieves information about a file or directory.
	 * @param {string|URL} fileOrDirPath The path to the file or directory to check.
	 * @returns {object} The information about the file or directory or undefined if not found.
	 */
	stat(fileOrDirPath) {
		const path = Path.from(fileOrDirPath);
		const object = findPath(this.#root, path);

		if (!object) {
			return undefined;
		}

		return {
			kind: object.kind,
			mtime: object.lastModified,
			size:
				object.kind === "file"
					? /** @type {MemoryHfsFile} */ (object).contents.byteLength
					: 0,
		};
	}

	/**
	 * Creates a directory and all of its ancestors.
	 * @param {string|URL} dirPath The path to create.
	 * @returns {void}
	 */
	mkdirp(dirPath) {
		for (const entry of writePath(
			this.#root,
			dirPath,
			new MemoryHfsDirectory(),
		)) {
			this.#objects.set(entry.id, entry);
		}
	}

	/**
	 * Reads the contents of a directory.
	 * @param {string|URL} dirPath The path to the directory to read.
	 * @returns {Array<import("@humanfs/types").HfsDirectoryEntry>} The names of the files and directories in the directory.
	 * @throws {NotFoundError} If the directory is not found.
	 * @throws {DirectoryError} If the path is not a directory.
	 */
	readdir(dirPath) {
		const object =
			dirPath === "."
				? this.#root
				: findPath(this.#root, Path.from(dirPath));

		if (!object) {
			throw new NotFoundError(`readdir ${dirPath}`);
		}

		if (object.kind !== "directory") {
			throw new DirectoryError(`readdir ${dirPath}`);
		}

		const directory = /** @type {MemoryHfsDirectory} */ (object);

		return Array.from(directory.entries()).map(([id, object]) => ({
			isFile: object.kind === "file",
			isDirectory: object.kind === "directory",
			isSymlink: false,
			name: id,
		}));
	}

	/**
	 * Removes a file or directory.
	 * @param {string|URL} fileOrDirPath The path to the file or directory to remove.
	 * @returns {void}
	 * @throws {Error} If the path is not found.
	 */
	rm(fileOrDirPath) {
		const path = Path.from(fileOrDirPath);
		const name = path.pop();
		const object = /** @type {MemoryHfsDirectory} */ (
			findPath(this.#root, path)
		);

		if (!object || !object.has(name)) {
			throw new NotFoundError(`rm ${fileOrDirPath}`);
		}

		object.delete(name);
	}
}
