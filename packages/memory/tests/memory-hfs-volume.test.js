/**
 * @fileoverview Tests for the MemoryHfsVolume class.
 * @author Nicholas C. Zakas
 */

/*global describe, it, TextEncoder, beforeEach */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import {
	MemoryHfsDirectory,
	MemoryHfsFile,
	MemoryHfsVolume,
} from "../src/memory-hfs-volume.js";
import assert from "node:assert";

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

function toBuffer(str) {
	return new TextEncoder().encode(str).buffer;
}

const HELLO_WORLD = toBuffer("Hello, world!");

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe("MemoryHfsVolume", () => {
	let volume;

	beforeEach(() => {
		volume = new MemoryHfsVolume();
	});

	describe("writeFile()", () => {
		it("should throw an error when writeFile() is called with a string as contents", () => {
			assert.throws(
				() => volume.writeFile("file.txt", "Hello, world!"),
				/Value must be an ArrayBuffer/,
			);
		});

		it("should throw an error when writeFile() is called with a number as contents", () => {
			assert.throws(
				() => volume.writeFile("file.txt", 42),
				/Value must be an ArrayBuffer/,
			);
		});

		it("should write a file to the volume", () => {
			volume.writeFile("file.txt", HELLO_WORLD);

			const file = volume.readFile("file.txt");
			assert.strictEqual(file, HELLO_WORLD);
		});

		it("should write a file to the volume with a parent directory", () => {
			volume.writeFile("dir/file.txt", HELLO_WORLD);

			const file = volume.readFile("dir/file.txt");
			assert.strictEqual(file, HELLO_WORLD);
		});

		it("should write a file to the volume with a parent directory that already exists", () => {
			volume.mkdirp("dir");
			volume.writeFile("dir/file.txt", HELLO_WORLD);

			const file = volume.readFile("dir/file.txt");
			assert.strictEqual(file, HELLO_WORLD);
		});
	});

	describe("readFile()", () => {
		it("should return undefined when reading a file that doesn't exist", () => {
			const file = volume.readFile("file.txt");
			assert.strictEqual(file, undefined);
		});

		it("should throw an error when the path is a directory", () => {
			volume.mkdirp("dir");
			assert.throws(
				() => volume.readFile("dir"),
				/Illegal operation on a directory/,
			);
		});

		it("should read a file from the volume", () => {
			volume.writeFile("file.txt", HELLO_WORLD);

			const file = volume.readFile("file.txt");
			assert.strictEqual(file, HELLO_WORLD);
		});

		it("should read a file from the volume with a parent directory", () => {
			volume.writeFile("dir/file.txt", HELLO_WORLD);

			const file = volume.readFile("dir/file.txt");
			assert.strictEqual(file, HELLO_WORLD);
		});
	});

	describe("mkdirp()", () => {
		it("should create a directory", () => {
			volume.mkdirp("dir");
			const dir = volume.readdir("dir");
			assert.deepStrictEqual(dir, []);
		});

		it("should create a directory with a parent directory", () => {
			volume.mkdirp("dir/subdir");
			const dir = volume.readdir("dir/subdir");
			assert.deepStrictEqual(dir, []);
		});

		it("should create a directory with a parent directory that already exists", () => {
			volume.mkdirp("dir");
			volume.mkdirp("dir/subdir");
			const dir = volume.readdir("dir/subdir");
			assert.deepStrictEqual(dir, []);
		});
	});

	describe("readdir()", () => {
		it("should throw an error when the path doesn't exist", () => {
			assert.throws(() => volume.readdir("dir"), /ENOENT/);
		});

		it("should throw an error when the path is a file", () => {
			volume.writeFile("file.txt", HELLO_WORLD);
			assert.throws(() => volume.readdir("file.txt"), /EPERM/);
		});

		it("should return an empty array when reading an empty directory", () => {
			volume.mkdirp("dir");
			const dir = volume.readdir("dir");
			assert.deepStrictEqual(dir, []);
		});

		it("should return an array of files when reading a directory with files", () => {
			volume.writeFile("dir/file1.txt", HELLO_WORLD);
			volume.writeFile("dir/file2.txt", HELLO_WORLD);

			const dir = volume.readdir("dir");
			assert.deepStrictEqual(dir, [
				{
					name: "file1.txt",
					isDirectory: false,
					isFile: true,
					isSymlink: false,
				},
				{
					name: "file2.txt",
					isDirectory: false,
					isFile: true,
					isSymlink: false,
				},
			]);
		});
	});

	describe("mv()", () => {
		it("should throw an error when the source path doesn't exist", () => {
			assert.throws(
				() => volume.mv("file.txt", "dir/file.txt"),
				/ENOENT/,
			);
		});

		it("should throw an error when the destination path is a directory", () => {
			volume.writeFile("file.txt", HELLO_WORLD);
			volume.mkdirp("dir");
			assert.throws(() => volume.mv("file.txt", "dir"), /EISDIR/);
		});

		it("should move a file to a new location", () => {
			volume.writeFile("file.txt", HELLO_WORLD);
			volume.mkdirp("dir");
			volume.mv("file.txt", "dir/file.txt");
			const file = volume.readFile("dir/file.txt");
			assert.deepEqual(file, HELLO_WORLD);
		});
	});

	describe("rm()", () => {
		it("should throw an error when the path doesn't exist", () => {
			assert.throws(() => volume.rm("file.txt"), /ENOENT/);
		});

		it("should remove a file", () => {
			volume.writeFile("file.txt", HELLO_WORLD);
			volume.rm("file.txt");
			assert.strictEqual(volume.readFile("file.txt"), undefined);
		});

		it("should remove a directory", () => {
			volume.mkdirp("dir");
			volume.rm("dir");

			assert.strictEqual(volume.stat("dir"), undefined);
		});
	});

	describe("stat()", () => {
		it("should return undefined when the path doesn't exist", () => {
			assert.strictEqual(volume.stat("file.txt"), undefined);
		});

		it("should return information about a file", () => {
			volume.writeFile("file.txt", HELLO_WORLD);
			const stats = volume.stat("file.txt");

			assert.strictEqual(stats.kind, "file");
			assert.strictEqual(stats.size, HELLO_WORLD.byteLength);
			assert.strictEqual(stats.mtime instanceof Date, true);
		});

		it("should return information about a directory", () => {
			volume.mkdirp("dir");
			const stats = volume.stat("dir");

			assert.strictEqual(stats.kind, "directory");
			assert.strictEqual(stats.size, 0);
			assert.strictEqual(stats.mtime instanceof Date, true);
		});
	});

	describe("cp()", () => {
		it("should throw an error when the source path doesn't exist", () => {
			assert.throws(
				() => volume.cp("file.txt", "dir/file.txt"),
				/ENOENT/,
			);
		});

		it("should throw an error when the destination path is a directory", () => {
			volume.writeFile("file.txt", HELLO_WORLD);
			volume.mkdirp("dir");
			assert.throws(() => volume.cp("file.txt", "dir"), /EISDIR/);
		});

		it("should copy a file to a new location", () => {
			volume.writeFile("file.txt", HELLO_WORLD);
			volume.mkdirp("dir");
			volume.cp("file.txt", "dir/file.txt");
			const file = volume.readFile("dir/file.txt");
			assert.deepEqual(file, HELLO_WORLD);
		});
	});

	describe("getObjectFromPath()", () => {
		it("should return a directory object when passed a directory path", () => {
			volume.mkdirp("dir");
			const object = volume.getObjectFromPath("dir");
			assert.strictEqual(object instanceof MemoryHfsDirectory, true);
			assert.strictEqual(object.id.startsWith("dir-"), true);
		});

		it("should return a file object when passed a file path", () => {
			volume.writeFile("file.txt", HELLO_WORLD);
			const object = volume.getObjectFromPath("file.txt");
			assert.strictEqual(object instanceof MemoryHfsFile, true);
			assert.strictEqual(object.id.startsWith("file-"), true);
		});

		it("should return undefined when the path doesn't exist", () => {
			const object = volume.getObjectFromPath("file.txt");
			assert.strictEqual(object, undefined);
		});
	});

	describe("getObject()", () => {
		it("should return a directory object when passed a directory ID", () => {
			volume.mkdirp("dir");
			const objectFromPath = volume.getObjectFromPath("dir");
			const objectFromId = volume.getObject(objectFromPath.id);
			assert.strictEqual(objectFromPath, objectFromId);
			assert.strictEqual(
				objectFromId instanceof MemoryHfsDirectory,
				true,
			);
		});

		it("should return a file object when passed a file ID", () => {
			volume.writeFile("file.txt", HELLO_WORLD);
			const objectFromPath = volume.getObjectFromPath("file.txt");
			const objectFromId = volume.getObject(objectFromPath.id);
			assert.strictEqual(objectFromPath, objectFromId);
			assert.strictEqual(objectFromId instanceof MemoryHfsFile, true);
		});

		it("should return undefined when the ID doesn't exist", () => {
			const object = volume.getObject("file-1");
			assert.strictEqual(object, undefined);
		});
	});

	describe("deleteObject()", () => {
		it("should delete a directory object", () => {
			volume.mkdirp("dir");
			const object = volume.getObjectFromPath("dir");
			volume.deleteObject(object.id);

			const stat = volume.stat("dir");
			assert.strictEqual(stat, undefined);
		});

		it("should delete a file object", () => {
			volume.writeFile("file.txt", HELLO_WORLD);
			const object = volume.getObjectFromPath("file.txt");
			volume.deleteObject(object.id);

			const stat = volume.stat("file.txt");
			assert.strictEqual(stat, undefined);
		});

		it("should delete a file in a subdirectory", () => {
			volume.writeFile("dir/file.txt", HELLO_WORLD);
			const object = volume.getObjectFromPath("dir/file.txt");
			volume.deleteObject(object.id);

			const stat = volume.stat("dir/file.txt");
			assert.strictEqual(stat, undefined);
		});

		it("should throw an error when the ID doesn't exist", () => {
			assert.throws(() => volume.deleteObject("file-1"), /ENOENT/);
		});
	});
});
