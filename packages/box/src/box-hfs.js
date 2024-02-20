/**
 * @fileoverview The main file for the box package.
 * @author Nicholas C. Zakas
 */
/* global TextEncoder, TextDecoder, URL */

//-----------------------------------------------------------------------------
// Types
//-----------------------------------------------------------------------------

/** @typedef{import("@humanfs/types").HfsImpl} HfsImpl */
/** @typedef{import("@humanfs/types").HfsDirectoryEntry} HfsDirectoryEntry */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { Hfs, Path, NotEmptyError, NotFoundError, DirectoryError } from "@humanfs/core";
import { BoxClient } from "./box-client.js";

//-----------------------------------------------------------------------------
// Exports
//-----------------------------------------------------------------------------

/**
 * A class representing the Node.js implementation of Hfs.
 * @implements {HfsImpl}
 */
export class BoxHfsImpl {

	/**
	 * The Box API client to use.
	 * @type {BoxClient}
	 */
	#client;

	/**
	 * The ID of the root folder.
	 * @type {string}
	 */
	#rootFolderId;

	/**
	 * Creates a new instance.
	 * @param {object} options The options for the instance.
	 * @param {string} options.token The access token to use for requests.
	 * @param {string} [options.apiBase] The base URL for the Box API.
	 * @param {string} [options.rootFolderId] The ID of the root folder to use.
	 * @throws {TypeError} If the token is not a string.
	 * @throws {TypeError} If the URL base is not a string.
	 * @throws {Error} If the token is not provided.
	 * @throws {Error} If the token is an empty string.
	 */
	constructor({ token, apiBase, rootFolderId = "0" }) {
		if (!token) {
			throw new Error("Token must be provided.");
		}

		if (typeof token !== "string") {
			throw new TypeError("Token must be a string.");
		}

		this.#rootFolderId = rootFolderId;
		this.#client = new BoxClient({ token, apiBase, rootFolderId });
	}

	/**
	 * Reads a file and returns the contents as an Uint8Array.
	 * @param {string|URL} filePath The path to the file to read.
	 * @returns {Promise<Uint8Array|undefined>} A promise that resolves with the contents
	 *    of the file or undefined if the file doesn't exist.
	 * @throws {Error} If the file cannot be read.
	 * @throws {TypeError} If the file path is not a string.
	 */
	async bytes(filePath) {
		const entry = await this.#client.findObject(Path.from(filePath));

		if (!entry) {
			return undefined;
		}

		return this.#client.download(entry.id)
			.then(response => response.arrayBuffer())
			.then(buffer => new Uint8Array(buffer));
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

		// first ensure that the directory exists
		const path = Path.from(filePath);
		const name = path.pop();
		const folder = await this.#client.ensurePathExists(path);

		// then upload the file
		await this.#client.uploadFile(name, folder.id, value);

	}

	/**
	 * Checks if a file exists.
	 * @param {string|URL} filePath The path to the file to check.
	 * @returns {Promise<boolean>} A promise that resolves with true if the
	 *    file exists or false if it does not.
	 */
	isFile(filePath) {
		return this.#client.findObject(Path.from(filePath))
			.then(entry => entry?.type === "file")
			.catch(() => false);
	}

	/**
	 * Checks if a directory exists.
	 * @param {string|URL} dirPath The path to the directory to check.
	 * @returns {Promise<boolean>} A promise that resolves with true if the
	 *    directory exists or false if it does not.
	 */
	isDirectory(dirPath) {
		return this.#client.findObject(Path.from(dirPath))
			.then(entry => entry?.type === "folder")
			.catch(() => false);
	}

	/**
	 * Creates a directory recursively.
	 * @param {string|URL} dirPath The path to the directory to create.
	 * @returns {Promise<void>} A promise that resolves when the directory is
	 *   created.
	 */
	async createDirectory(dirPath) {
		await this.#client.ensurePathExists(Path.from(dirPath));
	}

	/**
	 * Returns the size of a file. This method handles ENOENT errors
	 * and returns undefined in that case.
	 * @param {string|URL} filePath The path to the file to read.
	 * @returns {Promise<number|undefined>} A promise that resolves with the size of the
	 *  file in bytes or undefined if the file doesn't exist.
	 */
	async size(filePath) {

		const entry = await this.#client.findObject(Path.from(filePath));

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

		const entry = await this.#client.findObject(Path.from(fileOrDirPath));
		
		if (!entry) {
			return undefined;
		}

		return new Date(entry.modified_at);
	}


	/**
	 * Returns a list of directory entries for the given path.
	 * @param {string|URL} dirPath The path to the directory to read.
	 * @returns {AsyncIterable<HfsDirectoryEntry>} A promise that resolves with the
	 *   directory entries.
	 */
	async *list(dirPath) {

		/*
		 * The root directory is a special case that always has the folder ID
		 * "0". This is because the Box API doesn't have a way to fetch the root
		 * folder by name.
		 */
		const folderId = dirPath === "."
			? this.#rootFolderId
			: (await this.#client.findObject(Path.from(dirPath))).id;

		let marker = null;
		
		do {
			const data = await this.#client.fetchFolderItems(folderId, { marker });

			for (const item of data.entries) {
				yield {
					name: item.name,
					isDirectory: item.type === "folder",
					isFile: item.type === "file",
					isSymlink: false,
				};
			}

			marker = data.next_marker;
		} while (marker);

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

		const path = Path.from(fileOrDirPath);

		const entry = await this.#client.findObject(path);
		
		if (!entry) {
			return false;
		}

		// if it's a file, just go ahead and delete it
		if (entry.type === "file") {
			await this.#client.deleteFile(entry.id);
			return true;
		}

		// if it's a directory, check if it's empty
		const data = await this.#client.fetchFolderItems(entry.id, { limit: 1 });
		if (data.entries.length > 0) {
			throw new NotEmptyError(path.toString());
		}

		// if it's empty, delete it
		await this.#client.deleteFolder(entry.id);
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
	
		const path = Path.from(fileOrDirPath);
		let entry;

		try {
			entry = await this.#client.findObject(path);
		} catch (ex) {
			if (ex.code === "ENOENT") {
				return false;
			}

			throw ex;
		}

		if (!entry) {
			return false;
		}

		if (entry.type === "file") {
			await this.#client.deleteFile(entry.id);
			return true;
		}

		await this.#client.deleteFolder(entry.id);
		return true;
	}

	/**
	 * Copies a file from one location to another.
	 * @param {string|URL} source The path to the file to copy.
	 * @param {string|URL} destination The path to copy the file to.
	 * @returns {Promise<void>} A promise that resolves when the file is copied.
	 * @throws {Error} If the source file does not exist.
	 * @throws {Error} If the source file is a directory.
	 * @throws {Error} If the destination file is a directory.
	 */
	async copy(source, destination) {

		const sourcePath = Path.from(source);
		const destPath = Path.from(destination);

		const sourceFile = await this.#client.findObject(sourcePath);

		if (!sourceFile) {
			throw new NotFoundError(`copy ${sourcePath} -> ${destPath}`);
		}

		if (sourceFile.type === "folder") {
			throw new DirectoryError(`copy ${sourcePath} -> ${destPath}`);
		}

		// remove the file name to get the destination folder
		const newName = destPath.pop();
		const destFolder = await this.#client.findObject(destPath);

		if (!destFolder) {
			throw new NotFoundError(`copy ${sourcePath} -> ${destPath}`);
		}

		if (destFolder.type !== "folder") {
			throw new TypeError(`Destination is not a directory. copy ${sourcePath} -> ${destPath}`);
		}

		// check that the new name isn't already a directory
		const target = (await this.#client.fetchFolderItems(destFolder.id))
			.entries.find(item => item.name === newName);

		if (target?.type === "folder") {
			throw new DirectoryError(`copy ${sourcePath} -> ${destPath}`);
		}

		await this.#client.copyFile(sourceFile.id, destFolder.id, { name: newName });
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

		const sourcePath = Path.from(source);
		const destPath = Path.from(destination);
		const sourceEntry = await this.#client.findObject(sourcePath);

		if (!sourceEntry) {
			throw new NotFoundError(`copyAll ${sourcePath} -> ${destPath}`);
		}

		if (sourceEntry.type === "file") {
			return this.copy(source, destination);
		}

		// remove the file name to get the destination folder
		const newName = destPath.pop();
		const destFolder = await this.#client.findObject(destPath);

		if (destFolder.type !== "folder") {
			throw new TypeError(`Destination is not a directory. copy ${sourcePath} -> ${destPath}`);
		}

		await this.#client.copyFolder(sourceEntry.id, destFolder.id, { name: newName });
	}

	/**
	 * Moves a file from the source path to the destination path.
	 * @param {string|URL} source The location of the file to move.
	 * @param {string|URL} destination The destination of the file to move.
	 * @returns {Promise<void>} A promise that resolves when the move is complete.
	 * @throws {TypeError} If the file paths are not strings.
	 * @throws {Error} If the file cannot be moved.
	 */
	async move(source, destination) {

		const sourcePath = Path.from(source);
		const destPath = Path.from(destination);

		const sourceFile = await this.#client.findObject(sourcePath);

		if (!sourceFile) {
			throw new NotFoundError(`move ${sourcePath} -> ${destPath}`);
		}

		if (sourceFile.type === "folder") {
			throw new DirectoryError(`move ${sourcePath} -> ${destPath}`);
		}

		// remove the file name to get the destination folder
		const newName = destPath.pop();
		const destFolder = await this.#client.findObject(destPath);

		if (destFolder.type !== "folder") {
			throw new TypeError(`Destination is not a directory. move ${sourcePath} -> ${destPath}`);
		}

		await this.#client.moveFile(sourceFile.id, destFolder.id, { name: newName });
	}

	/**
	 * Moves a file or directory from the source path to the destination path.
	 * @param {string|URL} source The location of the file or directory to move.
	 * @param {string|URL} destination The destination of the file or directory to move.
	 * @returns {Promise<void>} A promise that resolves when the move is complete.
	 * @throws {TypeError} If the file paths are not strings.
	 * @throws {Error} If the file or directory cannot be moved.
	 */
	async moveAll(source, destination) {

		const sourcePath = Path.from(source);
		const destPath = Path.from(destination);
		const sourceEntry = await this.#client.findObject(sourcePath);

		if (!sourceEntry) {
			throw new NotFoundError(`moveAll ${sourcePath} -> ${destPath}`);
		}

		if (sourceEntry.type === "file") {
			return this.move(source, destination);
		}

		// remove the file name to get the destination folder
		const newName = destPath.pop();
		const destFolder = await this.#client.findObject(destPath);

		if (destFolder.type !== "folder") {
			throw new TypeError(`Destination is not a directory. move ${sourcePath} -> ${destPath}`);
		}

		await this.#client.moveFolder(sourceEntry.id, destFolder.id, { name: newName });
	}
}

/**
 * A class representing a file system utility library.
 * @implements {HfsImpl}
 */
export class BoxHfs extends Hfs {
	/**
	 * Creates a new instance.
	 * @param {object} options The options for the instance.
	 * @param {string} options.token The access token to use for requests.
	 * @param {string} [options.urlBase] The base URL for the Box API.
	 * @throws {TypeError} If the token is not a string.
	 * @throws {TypeError} If the URL base is not a string.
	 * @throws {Error} If the token is not provided.
	 * @throws {Error} If the token is an empty string.
	 */
	constructor({ token, urlBase }) {
		super({ impl: new BoxHfsImpl({ token, apiBase: urlBase }) });
	}
}
