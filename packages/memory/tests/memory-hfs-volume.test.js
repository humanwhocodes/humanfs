/**
 * @fileoverview Tests for the MemoryHfsVolume class.
 * @author Nicholas C. Zakas
 */

/*global describe, it, TextEncoder, beforeEach */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import { MemoryHfsVolume } from "../src/memory-hfs-volume.js";
import assert from "node:assert";

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

function toBuffer(str) {
	return new TextEncoder().encode(str).buffer;
}

const HELLO_WORLD = toBuffer("Hello, world!");
const GOODBYE_WORLD = toBuffer("Goodbye, world!");

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
			assert.deepStrictEqual(
				dir.map(({ id, ...entry }) => entry), [
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

	describe("getObjectIdFromPath()", () => {
		it("should return the ID of a directory object when passed a directory path", () => {
			volume.mkdirp("dir");
			const id = volume.getObjectIdFromPath("dir");
			assert.strictEqual(id.startsWith("dir-"), true);
		});

		it("should return the ID of a file object when passed a file path", () => {
			volume.writeFile("file.txt", HELLO_WORLD);
			const id = volume.getObjectIdFromPath("file.txt");
			assert.strictEqual(id.startsWith("file-"), true);
		});

		it("should return undefined when the path doesn't exist", () => {
			const id = volume.getObjectIdFromPath("file.txt");
			assert.strictEqual(id, undefined);
		});

		it("should return the ID of a file in a subdirectory", () => {
			volume.writeFile("dir/file.txt", HELLO_WORLD);
			const id = volume.getObjectIdFromPath("dir/file.txt");
			assert.strictEqual(id.startsWith("file-"), true);
		});

		it("should return the ID of a directory in a subdirectory", () => {
			volume.mkdirp("dir/subdir");
			const id = volume.getObjectIdFromPath("dir/subdir");
			assert.strictEqual(id.startsWith("dir-"), true);
		});
	});

	describe("deleteObject()", () => {
		it("should delete a directory object", () => {
			volume.mkdirp("dir");
			const id = volume.getObjectIdFromPath("dir");
			volume.deleteObject(id);

			const stat = volume.stat("dir");
			assert.strictEqual(stat, undefined);
		});

		it("should delete a file object", () => {
			volume.writeFile("file.txt", HELLO_WORLD);
			const id = volume.getObjectIdFromPath("file.txt");
			volume.deleteObject(id);

			const stat = volume.stat("file.txt");
			assert.strictEqual(stat, undefined);
		});

		it("should delete a file in a subdirectory", () => {
			volume.writeFile("dir/file.txt", HELLO_WORLD);
			const id = volume.getObjectIdFromPath("dir/file.txt");
			volume.deleteObject(id);

			const stat = volume.stat("dir/file.txt");
			assert.strictEqual(stat, undefined);
		});

		it("should throw an error when the ID doesn't exist", () => {
			assert.throws(() => volume.deleteObject("file-1"), /ENOENT/);
		});
	});

	describe("readFileObject()", () => {
		it("should return undefined when the ID doesn't exist", () => {
			const object = volume.readFileObject("file-1");
			assert.strictEqual(object, undefined);
		});

		it("should return a file object", () => {
			volume.writeFile("file.txt", HELLO_WORLD);
			const id = volume.getObjectIdFromPath("file.txt");
			const contents = volume.readFileObject(id);
			assert.deepStrictEqual(contents, HELLO_WORLD);
		});

		it("should throw an error when the ID is a directory", () => {
			volume.mkdirp("dir");
			const id = volume.getObjectIdFromPath("dir");
			assert.throws(() => volume.readFileObject(id), /EISDIR/);
		});
	});

	describe("writeFileObject()", () => {
		it("should write a file object", () => {
			volume.writeFile("file.txt", HELLO_WORLD);
			const id = volume.getObjectIdFromPath("file.txt");
			volume.writeFileObject(id, GOODBYE_WORLD);
			const contents = volume.readFile("file.txt");

			assert.deepStrictEqual(contents, GOODBYE_WORLD);
		});

		it("should throw an error when the ID is a directory", () => {
			volume.mkdirp("dir");
			const id = volume.getObjectIdFromPath("dir");
			assert.throws(
				() => volume.writeFileObject(id, GOODBYE_WORLD),
				/EISDIR/,
			);
		});

		it("should throw an error when the ID doesn't exist", () => {
			assert.throws(
				() => volume.writeFileObject("file-1", GOODBYE_WORLD),
				/ENOENT/,
			);
		});
	});

	describe("createFileObject()", () => {
		it("should create a file object", () => {
			volume.mkdirp("dir");
			const parentId = volume.getObjectIdFromPath("dir");
			const id = volume.createFileObject(
				"file.txt",
				parentId,
				HELLO_WORLD,
			);

			const contents = volume.readFileObject(id);
			assert.deepStrictEqual(contents, HELLO_WORLD);

			const stat = volume.stat("dir/file.txt");
			assert.strictEqual(stat.kind, "file");
		});

		it("should throw an error when the parent ID is a file", () => {
			volume.writeFile("file.txt", HELLO_WORLD);
			const parentId = volume.getObjectIdFromPath("file.txt");
			assert.throws(
				() =>
					volume.createFileObject("file.txt", parentId, HELLO_WORLD),
				/EISDIR/,
			);
		});

		it("should throw an error when the parent ID doesn't exist", () => {
			assert.throws(
				() =>
					volume.createFileObject("file.txt", "file-1", HELLO_WORLD),
				/ENOENT/,
			);
		});
	});

	describe("createDirectoryObject()", () => {
		it("should create a directory object", () => {
			volume.mkdirp("dir");
			const parentId = volume.getObjectIdFromPath("dir");
			volume.createDirectoryObject("subdir", parentId);

			const stat = volume.stat("dir/subdir");
			assert.strictEqual(stat.kind, "directory");
		});

		it("should create a directory object that a file can be added to", () => {
			volume.mkdirp("dir");
			const parentId = volume.getObjectIdFromPath("dir");
			const id = volume.createDirectoryObject("subdir", parentId);
			volume.createFileObject("file.txt", id, HELLO_WORLD);

			const contents = volume.readFileObject(
				volume.getObjectIdFromPath("dir/subdir/file.txt"),
			);
			assert.deepStrictEqual(contents, HELLO_WORLD);
		});

		it("should throw an error when the parent ID is a file", () => {
			volume.writeFile("file.txt", HELLO_WORLD);
			const parentId = volume.getObjectIdFromPath("file.txt");
			assert.throws(
				() => volume.createDirectoryObject("dir", parentId),
				/EISDIR/,
			);
		});

		it("should throw an error when the parent ID doesn't exist", () => {
			assert.throws(
				() => volume.createDirectoryObject("dir", "file-1"),
				/ENOENT/,
			);
		});
	});

	describe("readDirectoryObject()", () => {
		it("should throw an error when the ID doesn't exist", () => {
			assert.throws(() => volume.readDirectoryObject("file-1"), /ENOENT/);
		});

		it("should return an empty array when reading an empty directory", () => {
			volume.mkdirp("dir");
			const id = volume.getObjectIdFromPath("dir");
			const dir = volume.readDirectoryObject(id);
			assert.deepStrictEqual(dir, []);
		});

		it("should return an array of files when reading a directory with files", () => {
			volume.writeFile("dir/file1.txt", HELLO_WORLD);
			volume.writeFile("dir/file2.txt", HELLO_WORLD);

			const id = volume.getObjectIdFromPath("dir");
			const dir = volume.readDirectoryObject(id);
			assert.deepStrictEqual(
				dir.map(({ id, ...entry }) => entry), [
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

		it("should throw an error when the ID is a file", () => {
			volume.writeFile("file.txt", HELLO_WORLD);
			const id = volume.getObjectIdFromPath("file.txt");
			assert.throws(() => volume.readDirectoryObject(id), /EISDIR/);
		});
	});

	describe("moveObject()", () => {
		it("should move a file to a new location", () => {
			volume.writeFile("file.txt", HELLO_WORLD);
			volume.mkdirp("dir");

			const id = volume.getObjectIdFromPath("file.txt");
			const parentId = volume.getObjectIdFromPath("dir");
			volume.moveObject(id, parentId);

			const file = volume.readFile("dir/file.txt");
			assert.deepEqual(file, HELLO_WORLD);
		});

        it("should move a file to a new location with a new name", () => {
            volume.writeFile("file.txt", HELLO_WORLD);
            volume.mkdirp("dir");

            const id = volume.getObjectIdFromPath("file.txt");
            const parentId = volume.getObjectIdFromPath("dir");
            volume.moveObject(id, parentId, { name: "file2.txt"});

            const file = volume.readFile("dir/file2.txt");
            assert.deepEqual(file, HELLO_WORLD);
        });

		it("should move a directory to a new location", () => {
			volume.mkdirp("dir");
			volume.mkdirp("dir2");

			const id = volume.getObjectIdFromPath("dir");
			const parentId = volume.getObjectIdFromPath("dir2");
			volume.moveObject(id, parentId);

			const stat = volume.stat("dir2/dir");
			assert.strictEqual(stat.kind, "directory");
		});

        it("should move a directory to a new location with a new name", () => {
            volume.mkdirp("dir");
            volume.mkdirp("dir2");

            const id = volume.getObjectIdFromPath("dir");
            const parentId = volume.getObjectIdFromPath("dir2");
            volume.moveObject(id, parentId, { name: "dir3" });

            const stat = volume.stat("dir2/dir3");
            assert.strictEqual(stat.kind, "directory");
        });

		it("should throw an error when the ID doesn't exist", () => {
			assert.throws(() => volume.moveObject("file-1", "dir-1"), /ENOENT/);
		});

		it("should throw an error when the parent ID doesn't exist", () => {
			volume.writeFile("file.txt", HELLO_WORLD);
			const id = volume.getObjectIdFromPath("file.txt");
			assert.throws(() => volume.moveObject(id, "dir-1"), /ENOENT/);
		});

		it("should throw an error when the parent ID is a file", () => {
			volume.writeFile("file.txt", HELLO_WORLD);
			volume.writeFile("file2.txt", HELLO_WORLD);

			const id = volume.getObjectIdFromPath("file.txt");
			const parentId = volume.getObjectIdFromPath("file2.txt");
			assert.throws(() => volume.moveObject(id, parentId), /EISDIR/);
		});
	});

	describe("copyObject()", () => {
		it("should copy a file to a new location", () => {
			volume.writeFile("file.txt", HELLO_WORLD);
			volume.mkdirp("dir");

			const id = volume.getObjectIdFromPath("file.txt");
			const parentId = volume.getObjectIdFromPath("dir");
			volume.copyObject(id, parentId);

			const file = volume.readFile("dir/file.txt");
			assert.deepEqual(file, HELLO_WORLD);
		});

        it("should copy a file to a new location with a new name", () => {
            volume.writeFile("file.txt", HELLO_WORLD);
            volume.mkdirp("dir");

            const id = volume.getObjectIdFromPath("file.txt");
            const parentId = volume.getObjectIdFromPath("dir");
            volume.copyObject(id, parentId, { name: "file2.txt"});

            const file = volume.readFile("dir/file2.txt");
            assert.deepEqual(file, HELLO_WORLD);
        });

		it("should copy a directory to a new location", () => {
			volume.mkdirp("dir");
			volume.mkdirp("dir2");

			const id = volume.getObjectIdFromPath("dir");
			const parentId = volume.getObjectIdFromPath("dir2");
			volume.copyObject(id, parentId);

			const stat = volume.stat("dir2/dir");
			assert.strictEqual(stat.kind, "directory");
		});

        it("should copy a directory to a new location with a new name", () => {
            volume.mkdirp("dir");
            volume.mkdirp("dir2");

            const id = volume.getObjectIdFromPath("dir");
            const parentId = volume.getObjectIdFromPath("dir2");
            volume.copyObject(id, parentId, {name:"dir3"});

            const stat = volume.stat("dir2/dir3");
            assert.strictEqual(stat.kind, "directory");
        });

		it("should copy a directory recursively to a new location", () => {
			volume.mkdirp("dir");
			volume.writeFile("dir/file1.txt", HELLO_WORLD);
			volume.writeFile("dir/file2.txt", HELLO_WORLD);
			volume.mkdirp("dir/subdir");
			volume.writeFile("dir/subdir/file3.txt", HELLO_WORLD);

			volume.mkdirp("dir2");

			const id = volume.getObjectIdFromPath("dir");
			const parentId = volume.getObjectIdFromPath("dir2");
			volume.copyObject(id, parentId, { name: "dir3"});

			const stat1 = volume.stat("dir2/dir3/file1.txt");
			const stat2 = volume.stat("dir2/dir3/file2.txt");
			const stat3 = volume.stat("dir2/dir3/subdir/file3.txt");

			assert.strictEqual(stat1.kind, "file");
			assert.strictEqual(stat2.kind, "file");
			assert.strictEqual(stat3.kind, "file");
		});

		it("should throw an error when the ID doesn't exist", () => {
			assert.throws(() => volume.copyObject("file-1", "dir-1"), /ENOENT/);
		});

		it("should throw an error when the parent ID doesn't exist", () => {
			volume.writeFile("file.txt", HELLO_WORLD);
			const id = volume.getObjectIdFromPath("file.txt");
			assert.throws(() => volume.copyObject(id, "dir-1"), /ENOENT/);
		});

		it("should throw an error when the parent ID is a file", () => {
			volume.writeFile("file.txt", HELLO_WORLD);
			volume.writeFile("file2.txt", HELLO_WORLD);

			const id = volume.getObjectIdFromPath("file.txt");
			const parentId = volume.getObjectIdFromPath("file2.txt");
			assert.throws(() => volume.copyObject(id, parentId), /EISDIR/);
		});
	});

	describe("statObject()", () => {

		it("should return undefined when the ID doesn't exist", () => {
			assert.strictEqual(volume.statObject("file-1"), undefined);
		});

		it("should return information about a file", () => {
			volume.writeFile("file.txt", HELLO_WORLD);
			const id = volume.getObjectIdFromPath("file.txt");
			const stats = volume.statObject(id);

			assert.strictEqual(stats.kind, "file");
			assert.strictEqual(stats.size, HELLO_WORLD.byteLength);
			assert.strictEqual(stats.mtime instanceof Date, true);
		});

		it("should return information about a directory", () => {
			volume.mkdirp("dir");
			const id = volume.getObjectIdFromPath("dir");
			const stats = volume.statObject(id);

			assert.strictEqual(stats.kind, "directory");
			assert.strictEqual(stats.size, 0);
			assert.strictEqual(stats.mtime instanceof Date, true);
		});
	});
});
