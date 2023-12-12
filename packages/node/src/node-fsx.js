/**
 * @fileoverview The main file for the fsx package.
 * @author Nicholas C. Zakas
 */
/* global Buffer:readonly */

//-----------------------------------------------------------------------------
// Types
//-----------------------------------------------------------------------------

/** @typedef{import("@fsx/types").FsxImpl} FsxImpl */
/** @typedef{import("node:fs/promises")} Fsp */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { Fsx } from "@fsx/core";
import path from "node:path";

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
    #fs;

    /**
     * Creates a new instance.
     * @param {object} options The options for the instance.
     * @param {Fsp} options.fs The file system module to use.
     */
    constructor({ fs }) {
        this.#fs = fs;
    }

    /**
     * Reads a file and returns the contents as a string.
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
        return this.#fs.readFile(filePath, "utf8")
            .catch(error => {
                if (error.code === "ENOENT") {
                    return undefined;
                }

                throw error;
            });
    }

    /**
     * Reads a file and returns the contents as a JSON object.
     * @param {string} filePath The path to the file to read.
     * @returns {Promise<object|undefined>} A promise that resolves with the contents of
     *    the file or undefined if the file doesn't exist.
     * @throws {SyntaxError} If the file contents are not valid JSON.
     * @throws {Error} If the file cannot be read.
     * @throws {TypeError} If the file path is not a string.
     */
    json(filePath) {
        return this.text(filePath)
            .then(text => text === undefined ? text : JSON.parse(text));
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
        return this.#fs.readFile(filePath)
            .then(buffer => buffer.buffer)
            .catch(error => {
                if (error.code === "ENOENT") {
                    return undefined;
                }

                throw error;
            });
    }

    /**
     * Writes a value to a file.
     * @param {string} filePath The path to the file to write.
     * @param {string|ArrayBuffer} contents The contents to write to the
     *   file.
     * @returns {Promise<void>} A promise that resolves when the file is
     *  written.
     * @throws {TypeError} If the file path is not a string.
     * @throws {Error} If the file cannot be written.
     */
    async write(filePath, contents) {

        if (typeof filePath !== 'string') {
            throw new TypeError('filePath must be a string.');
        }

        if (typeof contents === 'string' || contents instanceof ArrayBuffer) {
            const value = contents instanceof ArrayBuffer ? Buffer.from(contents) : contents;
            return this.#fs.writeFile(filePath, value)
                .catch(error => {

                    // the directory may not exist, so create it
                    if (error.code === 'ENOENT') {
                        return this.#fs.mkdir(path.dirname(filePath), { recursive: true })
                            .then(() => this.#fs.writeFile(filePath, value));
                    } else {
                        throw error;
                    }
                });
        } else {
            throw new TypeError('Invalid contents type. Expected string or ArrayBuffer.');
        }
    }

    /**
     * Checks if a file exists.
     * @param {string} filePath The path to the file to check.
     * @returns {Promise<boolean>} A promise that resolves with true if the
     *    file exists or false if it does not.
     * @throws {TypeError} If the file path is not a string.
     */
    isFile(filePath) {
        return this.#fs.stat(filePath)
        .then(stat => stat.isFile())
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
        return this.#fs.stat(dirPath)
            .then(stat => stat.isDirectory())
            .catch(() => false);
    }

    /**
     * Creates a directory recursively.
     * @param {string} dirPath The path to the directory to create.
     * @returns {Promise<void>} A promise that resolves when the directory is
     *   created.
     */
    async createDirectory(dirPath) {
        await this.#fs.mkdir(dirPath, { recursive: true });
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
        return this.#fs.rm(fileOrDirPath, { recursive: true });
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
     * @param {Fsp} [options.fs] The file system module to use.
     */
    constructor({ fs } = {}) {
        super({ impl: new NodeFsxImpl({ fs })});
    }
}

export const fsx = new NodeFsx();
