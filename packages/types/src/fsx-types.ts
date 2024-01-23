/**
 * @fileoverview The types file for the fsx package.
 * @author Nicholas C. Zakas
 */

//------------------------------------------------------------------------------
// FsxImpl
//------------------------------------------------------------------------------

export interface FsxImpl {
	/**
	 * Reads the given file and returns the contents as text. Assumes the file is UTF-8 encoded.
	 * @param filePath The file to read.
	 * @returns The contents of the file or undefined if the file is empty.
	 */
	text?(filePath: string): Promise<string|undefined>;

	/**
	 * Reads the given file and returns the contents as JSON. Assumes the file is UTF-8 encoded.
	 * @param filePath The file to read.
	 * @returns The contents of the file as JSON or undefined if the file is empty.
	 */
	json?(filePath: string): Promise<any|undefined>;

	/**
	 * Reads the given file and returns the contents as an ArrayBuffer.
	 * @param filePath The file to read.
	 * @returns The contents of the file as an ArrayBuffer or undefined if the file is empty.
	 * @deprecated Use bytes() instead.
	 */
	arrayBuffer?(filePath: string): Promise<ArrayBuffer|undefined>;

	/**
	 * Reads the given file and returns the contents as an Uint8Array.
	 * @param filePath The file to read.
	 * @returns The contents of the file as a Uint8Array or undefined if the file is empty.
	 */
	bytes?(filePath: string): Promise<Uint8Array|undefined>;

	/**
	 * Writes the given data to the given file. For text, assumes UTF-8 encoding.
	 * @param filePath The file to write to.
	 * @param data The data to write.
	 * @returns A promise that resolves when the file is written.
	 * @throws {Error} If the file cannot be written.
	 */
	write?(filePath: string, data: string|ArrayBuffer|ArrayBufferView): Promise<void>;

	/**
	 * Checks if the given file exists.
	 * @param filePath The file to check.
	 * @returns True if the file exists, false if not.
	 * @throws {Error} If the operation fails with a code other than ENOENT.
	 */
	isFile?(filePath: string): Promise<boolean>;

	/**
	 * Checks if the given directory exists.
	 * @param dirPath The directory to check.
	 * @returns True if the directory exists, false if not.
	 * @throws {Error} If the operation fails with a code other than ENOENT.
	 */
	isDirectory?(dirPath: string): Promise<boolean>;

	/**
	 * Creates the given directory, including any necessary parents.
	 * @param dirPath The directory to create.
	 * @returns A promise that resolves when the directory is created.
	 * @throws {Error} If the directory cannot be created.
	 */
	createDirectory?(dirPath: string): Promise<void>;

	/**
	 * Deletes the given file or empty directory.
	 * @param fileOrDirPath The file or directory to delete.
	 * @returns A promise that resolves when the file or directory is deleted.
	 * @throws {Error} If the file or directory cannot be deleted.
	 */
	delete?(fileOrDirPath: string): Promise<void>;

	/**
	 * Deletes the given file or directory recursively.
	 * @param fileOrDirPath The file or directory to delete.
	 * @returns A promise that resolves when the file or directory is deleted.
	 * @throws {Error} If the file or directory cannot be deleted.
	 */
	deleteAll?(fileOrDirPath: string): Promise<void>;

	/**
	 * Returns a list of directory entries for the given path.
	 * @param dirPath The path to the directory to read.
	 * @returns A promise that resolves with the
	 *   directory entries.
	 * @throws {TypeError} If the directory path is not a string.
	 * @throws {Error} If the directory cannot be read.
	 */
	list?(dirPath:string): AsyncIterable<FsxDirectoryEntry>;
}

//------------------------------------------------------------------------------
// FsxDirEnt
//------------------------------------------------------------------------------

export interface FsxDirectoryEntry {

	/**
	 * The name of the file or directory.
	 */
	name: string;

	/**
	 * True if the entry is a directory, false if not.
	 */
	isDirectory: boolean;

	/**
	 * True if the entry is a file, false if not.
	 */
	isFile: boolean;

	/**
	 * True if the entry is a symbolic link, false if not.
	 */
	isSymlink: boolean;

}
