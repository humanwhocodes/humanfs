/**
 * @fileoverview The main file for the humanfs/path package.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Types
//-----------------------------------------------------------------------------

/** @typedef{import("@humanfs/types").HfsImpl} HfsImpl */
/** @typedef{import("@humanfs/types").HfsDirectoryEntry} HfsDirectoryEntry */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/**
 * Normalizes a path to use forward slashes.
 * @param {string} filePath The path to normalize.
 * @returns {string} The normalized path.
 */
function normalizePath(filePath) {
	let startIndex = 0;
	let endIndex = filePath.length;

	if (/[a-z]:\//i.test(filePath)) {
		startIndex = 3;
	}

	if (filePath.startsWith("./")) {
		startIndex = 2;
	}

	if (filePath.startsWith("/")) {
		startIndex = 1;
	}

	if (filePath.endsWith("/")) {
		endIndex = filePath.length - 1;
	}

	return filePath.slice(startIndex, endIndex).replace(/\\/g, "/");
}

/**
 * Asserts that the given name is a non-empty string, no equal to "." or "..",
 * and does not contain a forward slash or backslash.
 * @param {string} name The name to check.
 * @returns {void}
 * @throws {TypeError} When name is not valid.
 */
function assertValidName(name) {
	if (typeof name !== "string") {
		throw new TypeError("name must be a string");
	}

	if (!name) {
		throw new TypeError("name cannot be empty");
	}

	if (name === ".") {
		throw new TypeError(`name cannot be "."`);
	}

	if (name === "..") {
		throw new TypeError(`name cannot be ".."`);
	}

	if (name.includes("/") || name.includes("\\")) {
		throw new TypeError(
			`name cannot contain a slash or backslash: "${name}"`,
		);
	}
}

//-----------------------------------------------------------------------------
// Exports
//-----------------------------------------------------------------------------

export class Path {
	/**
	 * The steps in the path.
	 * @type {Array<string>}
	 */
	#steps;

	/**
	 * Creates a new instance.
	 * @param {Iterable<string>} [steps] The steps to use for the path.
	 * @throws {TypeError} When steps is not iterable.
	 */
	constructor(steps = []) {
		if (typeof steps[Symbol.iterator] !== "function") {
			throw new TypeError("steps must be iterable");
		}

		this.#steps = [...steps];
		this.#steps.forEach(assertValidName);
	}

	/**
	 * Adds steps to the end of the path.
	 * @param  {...string} steps The steps to add to the path.
	 * @returns {void}
	 */
	push(...steps) {
		steps.forEach(assertValidName);
		this.#steps.push(...steps);
	}

	/**
	 * Removes the last step from the path.
	 * @returns {string} The last step in the path.
	 */
	pop() {
		return this.#steps.pop();
	}

	/**
	 * Returns an iterator for the steps in the path.
	 * @returns {IterableIterator<string>} An iterator for the steps in the path.
	 */
	[Symbol.iterator]() {
		return this.#steps.values();
	}

	/**
	 * Retrieves the name (the last step) of the path.
	 * @type {string}
	 */
	get name() {
		return this.#steps[this.#steps.length - 1];
	}

	/**
	 * Sets the name (the last step) of the path.
	 * @type {string}
	 */
	set name(value) {
		assertValidName(value);
		this.#steps[this.#steps.length - 1] = value;
	}

	/**
	 * Retrieves the size of the path.
	 * @type {number}
	 */
	get size() {
		return this.#steps.length;
	}

	/**
	 * Returns the path as a string.
	 * @returns {string} The path as a string.
	 */
	toString() {
		return this.#steps.join("/");
	}

	/**
	 * Creates a new Path instance from a string.
	 * @param {string} fileOrDirPath The file or directory path to convert.
	 * @returns {Path} A new Path instance.
	 */
	static fromString(fileOrDirPath) {
		return new Path(normalizePath(fileOrDirPath).split("/"));
	}
}
