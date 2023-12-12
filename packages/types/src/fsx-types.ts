/**
 * @fileoverview The types file for the fsx package.
 * @author Nicholas C. Zakas
 */

//------------------------------------------------------------------------------
// FsxImpl
//------------------------------------------------------------------------------

export interface FsxImpl {
	/**
	 * Reads the given file and returns the contents as text.
	 * @param filePath The file to read.
	 * @returns The contents of the file or undefined if the file is empty.
	 */
	text?(filePath: string): Promise<string>;

	/**
	 * Reads the given file and returns the contents as JSON.
	 * @param filePath The file to read.
	 * @returns The contents of the file as JSON or undefined if the file is empty.
	 */
	json?(filePath: string): Promise<any>;

	/**
	 * Reads the given file and returns the contents as an ArrayBuffer.
	 * @param filePath The file to read.
	 * @returns The contents of the file as an ArrayBuffer or undefined if the file is empty.
	 */
	arrayBuffer?(filePath: string): Promise<ArrayBuffer>;

	/**
	 * Writes the given data to the given file.
	 * @param filePath The file to write to.
	 * @param data The data to write.
	 * @returns A promise that resolves when the file is written.
	 * @throws {Error} If the file cannot be written.
	 */
	write?(filePath: string, data: string | ArrayBuffer): Promise<void>;

	/**
	 * Checks if the given file exists.
	 * @param filePath The file to check.
	 * @returns True if the file exists, false if not.
	 */
	isFile?(filePath: string): Promise<boolean>;

	/**
	 * Checks if the given directory exists.
	 * @param dirPath The directory to check.
	 * @returns True if the directory exists, false if not.
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
	 * Deletes the given file or directory.
	 * @param fileOrDirPath The file or directory to delete.
	 * @returns A promise that resolves when the file or directory is deleted.
	 * @throws {Error} If the file or directory cannot be deleted.
	 */
	delete?(fileOrDirPath: string): Promise<void>;
}
