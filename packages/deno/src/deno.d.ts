/**
 * @fileover Custom type definitions for Deno to allow Node.js to run `tsc`
 * without errors. When running in Deno, this isn't used.
 * @author Nicholas C. Zakas
 */

declare namespace Deno {
	function mkdir(path: string): Promise<void>;
	function readFile(path: string): Promise<Uint8Array>;
	function readTextFile(path: string): Promise<string>;
	function remove(path: string): Promise<void>;
	function stat(path: string): Promise<FileInfo>;
	function writeFile(path: string, data: string | Uint8Array): Promise<void>;
	function writeTextFile(path: string, data: string): Promise<void>;

	interface FileInfo {
		isFile: boolean;
		isDirectory: boolean;
		size: number;
		mtime: Date | null;
		atime: Date | null;
		birthtime: Date | null;
	}
}
