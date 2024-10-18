/**
 * @fileoverview The internals of the MemoryHfsImpl.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import {
	Path,
	NotFoundError,
	DirectoryError,
	PermissionError,
} from "@humanfs/core";

//-----------------------------------------------------------------------------
// Types
//-----------------------------------------------------------------------------

/** @typedef {import("@humanfs/types").HfsDirectoryEntry} HfsDirectoryEntry */

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

	while (object.find(key)) {
		if (parts.length === 0) {
			return object.find(key);
		}

		object = /** @type {MemoryHfsDirectory} */ (object.find(key));
		key = parts.shift();
	}

	return undefined;
}

/**
 * Writes a file or directory to the volume.
 * @param {MemoryHfsDirectory} volume The volume to search.
 * @param {string|URL} fileOrDirPath The path to the file or directory to find.
 * @param {MemoryHfsDirectory|MemoryHfsFile|undefined} entry The value to write.
 * @returns {Array<MemoryHfsDirectory|MemoryHfsFile>} The files and directories created,
 *    including `value`, or undefined if the directory already exists.
 */
function writePath(volume, fileOrDirPath, entry) {
	const path = Path.from(fileOrDirPath);
	const name = path.pop();
	let directory = volume;
	const created = [];

	// create any missing directories
	for (const step of path) {
		let entry = directory.find(step);

		if (!entry) {
			entry = new MemoryHfsDirectory({
				name: step,
			});
			directory.add(entry);
			created.push(entry);
		}

		directory = /** @type {MemoryHfsDirectory} */ (entry);
	}

	// we don't want to overwrite an existing directory
	if (
		directory &&
		directory.find(name)?.kind === "directory" &&
		entry.kind === "directory"
	) {
		return [];
	}

	entry.name = name;
	directory.add(entry);
	created.push(entry);

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
	 * The name of the file.
	 * @type {string}
	 */
	name;

	/**
	 * Creates a new instance.
	 * @param {object} options The options for the file.
	 * @param {string} [options.name] The name of the file.
	 * @param {ArrayBuffer} options.contents The contents of the file.
	 * @throws {TypeError} If the contents are not an ArrayBuffer.
	 */
	constructor({ name, contents }) {
		assertArrayBuffer(contents);
		this.#contents = contents;
		this.name = name;
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
		return new MemoryHfsFile({
			name: this.name,
			contents: this.#contents.slice(0),
		});
	}
}

/**
 * A class representing a directory in memory.
 * It extends Map to provide the functionality of a directory.
 */
export class MemoryHfsDirectory {
	/**
	 * The unique identifier for the directory.
	 * @type {string}
	 * @readonly
	 */
	#id = `dir-${objectId++}`;

	/**
	 * The entries in the directory.
	 * @type {Array<MemoryHfsFile|MemoryHfsDirectory>}
	 * @readonly
	 */
	#entries;

	/**
	 * The name of the directory.
	 * @type {string}
	 */
	name;

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
	 * Creates a new instance.
	 * @param {Object} [options] The options for the directory.
	 * @param {string} [options.name] The name of the directory.
	 * @param {Array<MemoryHfsFile|MemoryHfsDirectory>} [options.entries] The entries in the directory.
	 */
	constructor({ name, entries = [] } = {}) {
		this.name = name;
		this.#entries = entries;
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
	 * The parent directory of the file.
	 * @type {MemoryHfsDirectory|undefined}
	 * @readonly
	 */
	get parent() {
		return parents.get(this);
	}

	/**
	 * Finds an entry with the given name in the directory.
	 * @param {string} name The name of the entry to find.
	 * @returns {MemoryHfsFile|MemoryHfsDirectory|undefined} The entry found or undefined if not found.
	 */
	find(name) {
		return this.#entries.find(entry => entry.name === name);
	}

	/**
	 * Adds an entry in the directory.
	 * @param {MemoryHfsFile|MemoryHfsDirectory} entry The value to set.
	 * @returns {this} The instance for chaining.
	 */
	add(entry) {
		const existing = this.find(entry.name);

		// if there's already an entry in this name then delete it from the tree
		if (existing) {
			parents.delete(existing);

			const index = this.#entries.indexOf(existing);
			this.#entries.splice(index, 1);
		}

		this.#entries.push(entry);
		entry.lastModified = new Date();
		parents.set(entry, this);

		return this;
	}

	/**
	 * Deletes an entry from the directory.
	 * @param {string} name The name of the entry to delete.
	 * @returns {boolean} True if the key was deleted, false if not.
	 */
	delete(name) {
		this.lastModified = new Date();

		const entry = this.find(name);

		if (entry) {
			if (entry.kind === "directory") {
				parents.delete(entry);
			}

			const index = this.#entries.indexOf(entry);
			this.#entries.splice(index, 1);

			return true;
		}

		return false;
	}

	/**
	 * Creates a copy of the directory.
	 * @returns {MemoryHfsDirectory} The new directory.
	 */
	clone() {
		return new MemoryHfsDirectory({
			name: this.name,
			entries: this.#entries.map(entry => entry.clone()),
		});
	}

	/**
	 * Returns an iterator over the entries in the directory.
	 * @returns {IterableIterator<[string, MemoryHfsFile|MemoryHfsDirectory]>} The iterator.
	 */
	*entries() {
		for (const entry of this.#entries) {
			yield [entry.name, entry];
		}
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
	#root = new MemoryHfsDirectory({ name: "." });

	//-----------------------------------------------------------------------------
	// ID-Based Methods
	//-----------------------------------------------------------------------------

	/**
	 * Retrieves an object by its ID.
	 * @param {string} id The ID of the object to retrieve.
	 * @returns {MemoryHfsFile|MemoryHfsDirectory|undefined} The object or undefined if not found.
	 * @throws {TypeError} If the ID is not a string.
	 */
	#getObject(id) {
		if (typeof id !== "string") {
			throw new TypeError("ID must be a string.");
		}

		return this.#objects.get(id);
	}

	/**
	 * Retrieves an object by its path.
	 * @param {string|URL} path The path to the object to retrieve.
	 * @returns {MemoryHfsFile|MemoryHfsDirectory|undefined} The object or undefined if not found.
	 * @throws {TypeError} If the path is not a string or URL.
	 */
	#getObjectFromPath(path) {
		return findPath(this.#root, Path.from(path));
	}

	/**
	 * Retrieves the ID of an object by its path.
	 * @param {string|URL} path The path to the object to retrieve.
	 * @returns {string|undefined} The ID of the object or undefined if not found.
	 * @throws {TypeError} If the path is not a string or URL.
	 */
	getObjectIdFromPath(path) {
		const object = findPath(this.#root, Path.from(path));
		return object ? object.id : undefined;
	}

	/**
	 * Deletes an object by its ID.
	 * @param {string} id The ID of the object to delete.
	 * @returns {void}
	 */
	deleteObject(id) {
		// throw an error if the object doesn't exist
		const object = this.#objects.get(id);

		if (!object) {
			throw new NotFoundError(`deleteObject ${id}`);
		}

		// remove the object from the tree
		object.parent.delete(object.name);

		// remove the object from the map
		this.#objects.delete(id);
	}

	/**
	 * Creates a file.
	 * @param {string} name The name of the file.
	 * @param {string} parentId The ID of the parent directory.
	 * @param {ArrayBuffer} contents The contents of the file.
	 * @returns {string} The ID of the file.
	 * @throws {DirectoryError} If the parent ID is not a directory.
	 * @throws {NotFoundError} If the parent ID is not found.
	 * @throws {TypeError} If the contents are not an ArrayBuffer.
	 */
	createFileObject(name, parentId, contents) {
		const parent = this.#objects.get(parentId);

		if (!parent) {
			throw new NotFoundError(`createObject ${parentId}`);
		}

		if (parent.kind !== "directory") {
			throw new DirectoryError(`createObject ${parentId}`);
		}

		const directory = /** @type {MemoryHfsDirectory} */ (parent);
		const file = new MemoryHfsFile({ name, contents });

		directory.add(file);
		this.#objects.set(file.id, file);

		return file.id;
	}

	/**
	 * Creates a directory.
	 * @param {string} name The name of the directory.
	 * @param {string} parentId The ID of the parent directory.
	 * @returns {string} The ID of the directory.
	 * @throws {DirectoryError} If the parent ID is not a directory.
	 * @throws {NotFoundError} If the parent ID is not found.
	 */
	createDirectoryObject(name, parentId) {
		const parent = this.#objects.get(parentId);

		if (!parent) {
			throw new NotFoundError(`createObject ${parentId}`);
		}

		if (parent.kind !== "directory") {
			throw new DirectoryError(`createObject ${parentId}`);
		}

		const directory = /** @type {MemoryHfsDirectory} */ (parent);
		const newDirectory = new MemoryHfsDirectory({ name });

		directory.add(newDirectory);
		this.#objects.set(newDirectory.id, newDirectory);

		return newDirectory.id;
	}

	/**
	 * Reads the contents of a file.
	 * @param {string} id The ID of the file to read.
	 * @returns {ArrayBuffer|undefined} The contents of the file or
	 * undefined if not found.
	 * @throws {NotFoundError} If the file is not found.
	 * @throws {DirectoryError} If the ID is not a file.
	 */
	readFileObject(id) {
		const object = this.#objects.get(id);

		if (!object) {
			return undefined;
		}

		if (object.kind !== "file") {
			throw new DirectoryError(`readObject ${id}`);
		}

		return /** @type {MemoryHfsFile} */ (object).contents;
	}

	/**
	 * Writes the contents of a file.
	 * @param {string} id The ID of the file to write.
	 * @param {ArrayBuffer} contents The contents to write.
	 * @returns {void}
	 * @throws {NotFoundError} If the file is not found.
	 * @throws {DirectoryError} If the ID is not a file.
	 * @throws {TypeError} If the contents are not an ArrayBuffer.
	 */
	writeFileObject(id, contents) {
		const object = this.#objects.get(id);

		if (!object) {
			throw new NotFoundError(`writeObject ${id}`);
		}

		if (object.kind !== "file") {
			throw new DirectoryError(`writeObject ${id}`);
		}

		const file = /** @type {MemoryHfsFile} */ (object);
		file.contents = contents;
	}

	/**
	 * Reads the contents of a directory.
	 * @param {string} id The ID of the directory to read.
	 * @returns {Array<HfsDirectoryEntry>} The names of the files and directories in the directory.
	 * @throws {NotFoundError} If the directory is not found.
	 * @throws {DirectoryError} If the ID is not a directory.
	 */
	readDirectoryObject(id) {
		const object = this.#objects.get(id);

		if (!object) {
			throw new NotFoundError(`readObject ${id}`);
		}

		if (object.kind !== "directory") {
			throw new DirectoryError(`readObject ${id}`);
		}

		const directory = /** @type {MemoryHfsDirectory} */ (object);

		return Array.from(directory.entries()).map(([name, object]) => ({
			isFile: object.kind === "file",
			isDirectory: object.kind === "directory",
			isSymlink: false,
			name: name,
		}));
	}

	/**
	 * Moves an object to a new parent.
	 * @param {string} id The ID of the object to move.
	 * @param {string} parentId The ID of the new parent directory.
	 * @returns {void}
	 * @throws {NotFoundError} If the object or parent is not found.
	 * @throws {DirectoryError} If the parent is not a directory.
	 */
	moveObject(id, parentId) {
		const object = this.#objects.get(id);

		if (!object) {
			throw new NotFoundError(`moveObject ${id}`);
		}

		const parent = this.#objects.get(parentId);

		if (!parent) {
			throw new NotFoundError(`moveObject ${parentId}`);
		}

		if (parent.kind !== "directory") {
			throw new DirectoryError(`moveObject ${parentId}`);
		}

		const directory = /** @type {MemoryHfsDirectory} */ (parent);

		object.parent.delete(object.name);
		directory.add(object);
	}

	/**
	 * Copies an object to a new parent.
	 * @param {string} id The ID of the object to copy.
	 * @param {string} parentId The ID of the new parent directory.
	 * @returns {void}
	 * @throws {NotFoundError} If the object or parent is not found.
	 * @throws {DirectoryError} If the parent is not a directory.
	 * @throws {DirectoryError} If the parent is a file.
	 */
	copyObject(id, parentId) {
		const object = this.#objects.get(id);

		if (!object) {
			throw new NotFoundError(`copyObject ${id}`);
		}

		const parent = this.#objects.get(parentId);

		if (!parent) {
			throw new NotFoundError(`copyObject ${parentId}`);
		}

		if (parent.kind !== "directory") {
			throw new DirectoryError(`copyObject ${parentId}`);
		}

		const directory = /** @type {MemoryHfsDirectory} */ (parent);
		const copy = object.clone();

		directory.add(copy);
		this.#objects.set(copy.id, copy);
	}

	//-----------------------------------------------------------------------------
	// Path-Based Methods
	//-----------------------------------------------------------------------------

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
			new MemoryHfsFile({ contents }),
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

		const name = destPath.pop();
		const destDir = /** @type {MemoryHfsDirectory} */ (
			findPath(this.#root, destPath)
		);

		const newObject = object.clone();
		newObject.name = name;
		destDir.add(newObject);
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
		const newObject = object.clone();
		newObject.name = name;
		destDir.add(newObject);

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
			throw new PermissionError(`readdir ${dirPath}`);
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

		if (!object || !object.find(name)) {
			throw new NotFoundError(`rm ${fileOrDirPath}`);
		}

		object.delete(name);
	}
}
