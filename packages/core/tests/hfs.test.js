/**
 * @fileoverview Tests for the Hfs class.
 * @author Nicholas C. Zakas
 */
/* global it, describe */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import { Hfs, NoSuchMethodError, ImplAlreadySetError } from "../src/hfs.js";
import assert from "node:assert";

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/**
 * Strips the timestamp from a log entry.
 * @param {LogEntry} logEntry The log entry to strip.
 * @returns {object} The log entry without the timestamp.
 */
function normalizeLogEntry({ timestamp, ...rest }) {
	return rest;
}

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe("Hfs", () => {
	describe("Missing Methods", () => {
		["text", "json", "bytes", "bytes"].forEach(methodName => {
			it(`should reject a promise when the ${methodName}() method is not present on the impl`, () => {
				const hfs = new Hfs({ impl: {} });

				assert.rejects(
					hfs[methodName]("/path/to/file.txt"),
					new NoSuchMethodError(methodName),
				);
			});
		});
	});

	describe("Changing impl", () => {
		it("should change the impl when setImpl() is called", async () => {
			const hfs = new Hfs({ impl: {} });
			const impl1 = {
				text() {
					return "Hello, world!";
				},
			};

			hfs.setImpl(impl1);

			const result = await hfs.text("/path/to/file.txt");
			assert.strictEqual(result, "Hello, world!");
		});

		it("should change the impl back when resetImpl() is called", async () => {
			const hfs = new Hfs({ impl: {} });
			const impl1 = {
				text() {
					return "Hello, world!";
				},
			};

			hfs.setImpl(impl1);

			const result = await hfs.text("/path/to/file.txt");
			assert.strictEqual(result, "Hello, world!");

			hfs.resetImpl();

			assert.rejects(
				hfs.text("/path/to/file.txt"),
				new NoSuchMethodError("text"),
			);
		});

		it("should reject a promise when setImpl() is called twice", async () => {
			const hfs = new Hfs({ impl: {} });
			hfs.setImpl({});

			assert.throws(() => {
				hfs.setImpl({});
			}, new ImplAlreadySetError());
		});

		it("should return true for isBaseImpl() when the base impl is in use", () => {
			const hfs = new Hfs({ impl: {} });
			assert.strictEqual(hfs.isBaseImpl(), true);
		});

		it("should return true for isBaseImpl() when the impl is reset", () => {
			const hfs = new Hfs({ impl: {} });
			const impl1 = {
				text() {
					return "Hello, world!";
				},
			};

			hfs.setImpl(impl1);
			assert.strictEqual(hfs.isBaseImpl(), false);

			hfs.resetImpl();
			assert.strictEqual(hfs.isBaseImpl(), true);
		});
	});

	describe("logStart() and logEnd()", () => {
		it("should start a new log and add an entry", async () => {
			const hfs = new Hfs({
				impl: {
					text() {
						return "Hello, world!";
					},
				},
			});

			hfs.logStart("test");
			await hfs.text("/path/to/file.txt");
			const logs = hfs.logEnd("test").map(normalizeLogEntry);
			assert.deepStrictEqual(logs, [
				{
					type: "call",
					data: {
						methodName: "text",
						args: ["/path/to/file.txt"],
					},
				},
			]);
		});

		it("should start two new logs and add an entry to both", async () => {
			const hfs = new Hfs({
				impl: {
					text() {
						return "Hello, world!";
					},
				},
			});

			hfs.logStart("test1");
			hfs.logStart("test2");
			await hfs.text("/path/to/file.txt");
			const logs1 = hfs.logEnd("test1").map(normalizeLogEntry);
			const logs2 = hfs.logEnd("test2").map(normalizeLogEntry);

			assert.deepStrictEqual(logs1, [
				{
					type: "call",
					data: {
						methodName: "text",
						args: ["/path/to/file.txt"],
					},
				},
			]);
			assert.deepStrictEqual(logs2, [
				{
					type: "call",
					data: {
						methodName: "text",
						args: ["/path/to/file.txt"],
					},
				},
			]);
		});
	});

	describe("text", () => {
		it("should return the text from the file", async () => {
			const hfs = new Hfs({
				impl: {
					text() {
						return "Hello, world!";
					},
				},
			});

			const result = await hfs.text("/path/to/file.txt");
			assert.strictEqual(result, "Hello, world!");
		});

		it("should log the method call", async () => {
			const hfs = new Hfs({
				impl: {
					text() {
						return "Hello, world!";
					},
				},
			});

			hfs.logStart("text");
			hfs.text("/path/to/file.txt");
			const logs = hfs.logEnd("text").map(normalizeLogEntry);
			assert.deepStrictEqual(logs, [
				{
					type: "call",
					data: {
						methodName: "text",
						args: ["/path/to/file.txt"],
					},
				},
			]);
		});

		it("should reject a promise when the file path is not a string", () => {
			const hfs = new Hfs({
				impl: {
					text() {
						return "Hello, world!";
					},
				},
			});

			assert.rejects(
				hfs.text(123),
				new TypeError("File path must be a non-empty string."),
			);
		});

		it("should reject a promise when the file path is empty", () => {
			const hfs = new Hfs({
				impl: {
					text() {
						return "Hello, world!";
					},
				},
			});

			assert.rejects(
				hfs.text(""),
				new TypeError("File path must be a non-empty string."),
			);
		});
	});

	describe("json", () => {
		it("should return the JSON from the file", async () => {
			const hfs = new Hfs({
				impl: {
					json() {
						return { foo: "bar" };
					},
				},
			});

			const result = await hfs.json("/path/to/file.txt");
			assert.deepStrictEqual(result, { foo: "bar" });
		});

		it("should log the method call", async () => {
			const hfs = new Hfs({
				impl: {
					json() {
						return { foo: "bar" };
					},
				},
			});

			hfs.logStart("json");
			await hfs.json("/path/to/file.txt");
			const logs = hfs.logEnd("json").map(normalizeLogEntry);
			assert.deepStrictEqual(logs, [
				{
					type: "call",
					data: {
						methodName: "json",
						args: ["/path/to/file.txt"],
					},
				},
			]);
		});

		it("should reject a promise when the file path is not a string", () => {
			const hfs = new Hfs({
				impl: {
					json() {
						return { foo: "bar" };
					},
				},
			});

			assert.rejects(
				hfs.json(123),
				new TypeError("File path must be a non-empty string."),
			);
		});

		it("should reject a promise when the file path is empty", () => {
			const hfs = new Hfs({
				impl: {
					json() {
						return { foo: "bar" };
					},
				},
			});

			assert.rejects(
				hfs.json(""),
				new TypeError("File path must be a non-empty string."),
			);
		});
	});

	describe("arrayBuffer", () => {
		it("should return the bytes from the file", async () => {
			const hfs = new Hfs({
				impl: {
					arrayBuffer() {
						return new Uint8Array([1, 2, 3]).buffer;
					},
				},
			});

			const result = await hfs.arrayBuffer("/path/to/file.txt");
			assert.deepStrictEqual(result, new Uint8Array([1, 2, 3]).buffer);
		});

		it("should log the method call", async () => {
			const hfs = new Hfs({
				impl: {
					arrayBuffer() {
						return new Uint8Array([1, 2, 3]).buffer;
					},
				},
			});

			hfs.logStart("arrayBuffer");
			await hfs.arrayBuffer("/path/to/file.txt");
			const logs = hfs.logEnd("arrayBuffer").map(normalizeLogEntry);
			assert.deepStrictEqual(logs, [
				{
					type: "call",
					data: {
						methodName: "arrayBuffer",
						args: ["/path/to/file.txt"],
					},
				},
			]);
		});

		it("should reject a promise when the file path is not a string", () => {
			const hfs = new Hfs({
				impl: {
					arrayBuffer() {
						return new Uint8Array([1, 2, 3]).buffer;
					},
				},
			});

			assert.rejects(
				hfs.arrayBuffer(123),
				/File path must be a non-empty string/,
			);
		});

		it("should reject a promise when the file path is empty", () => {
			const hfs = new Hfs({
				impl: {
					arrayBuffer() {
						return new Uint8Array([1, 2, 3]).buffer;
					},
				},
			});

			assert.rejects(
				hfs.arrayBuffer(""),
				/File path must be a non-empty string/,
			);
		});
	});

	describe("bytes", () => {
		it("should return the bytes from the file", async () => {
			const hfs = new Hfs({
				impl: {
					bytes() {
						return new Uint8Array([1, 2, 3]).buffer;
					},
				},
			});

			const result = await hfs.bytes("/path/to/file.txt");
			assert.deepStrictEqual(result, new Uint8Array([1, 2, 3]).buffer);
		});

		it("should log the method call", async () => {
			const hfs = new Hfs({
				impl: {
					bytes() {
						return new Uint8Array([1, 2, 3]).buffer;
					},
				},
			});

			hfs.logStart("bytes");
			await hfs.bytes("/path/to/file.txt");
			const logs = hfs.logEnd("bytes").map(normalizeLogEntry);
			assert.deepStrictEqual(logs, [
				{
					type: "call",
					data: {
						methodName: "bytes",
						args: ["/path/to/file.txt"],
					},
				},
			]);
		});

		it("should reject a promise when the file path is not a string", () => {
			const hfs = new Hfs({
				impl: {
					bytes() {
						return new Uint8Array([1, 2, 3]).buffer;
					},
				},
			});

			assert.rejects(
				hfs.bytes(123),
				new TypeError("File path must be a non-empty string."),
			);
		});

		it("should reject a promise when the file path is empty", () => {
			const hfs = new Hfs({
				impl: {
					bytes() {
						return new Uint8Array([1, 2, 3]).buffer;
					},
				},
			});

			assert.rejects(
				hfs.bytes(""),
				new TypeError("File path must be a non-empty string."),
			);
		});
	});

	describe("bytes", () => {
		it("should return the bytes from the file", async () => {
			const hfs = new Hfs({
				impl: {
					bytes() {
						return new Uint8Array([1, 2, 3]);
					},
				},
			});

			const result = await hfs.bytes("/path/to/file.txt");
			assert.deepStrictEqual(result, new Uint8Array([1, 2, 3]));
		});

		it("should log the method call", async () => {
			const hfs = new Hfs({
				impl: {
					bytes() {
						return new Uint8Array([1, 2, 3]);
					},
				},
			});

			hfs.logStart("bytes");
			await hfs.bytes("/path/to/file.txt");
			const logs = hfs.logEnd("bytes").map(normalizeLogEntry);
			assert.deepStrictEqual(logs, [
				{
					type: "call",
					data: {
						methodName: "bytes",
						args: ["/path/to/file.txt"],
					},
				},
			]);
		});

		it("should reject a promise when the file path is not a string", () => {
			const hfs = new Hfs({
				impl: {
					bytes() {
						return new Uint8Array([1, 2, 3]);
					},
				},
			});

			assert.rejects(
				hfs.bytes(123),
				new TypeError("File path must be a non-empty string."),
			);
		});

		it("should reject a promise when the file path is empty", () => {
			const hfs = new Hfs({
				impl: {
					bytes() {
						return new Uint8Array([1, 2, 3]);
					},
				},
			});

			assert.rejects(
				hfs.bytes(""),
				new TypeError("File path must be a non-empty string."),
			);
		});
	});

	describe("write()", () => {
		it("should not reject a promise when the value to write is a string", async () => {
			const hfs = new Hfs({
				impl: {
					write() {
						return undefined;
					},
				},
			});

			await hfs.write("/path/to/file.txt", "Hello, world!");
		});

		it("should not reject a promise when the value to write is an ArayBuffer", async () => {
			const hfs = new Hfs({
				impl: {
					write() {
						return undefined;
					},
				},
			});

			await hfs.write(
				"/path/to/file.txt",
				new Uint8Array([1, 2, 3]).buffer,
			);
		});

		it("should not reject a promise when the value to write is a Uint8Array", async () => {
			const hfs = new Hfs({
				impl: {
					write() {
						return undefined;
					},
				},
			});

			await hfs.write("/path/to/file.txt", new Uint8Array([1, 2, 3]));
		});

		it("should log the method call", async () => {
			const hfs = new Hfs({
				impl: {
					write() {
						return undefined;
					},
				},
			});

			hfs.logStart("write");
			await hfs.write("/path/to/file.txt", "Hello, world!");
			const logs = hfs.logEnd("write").map(normalizeLogEntry);
			assert.deepStrictEqual(logs, [
				{
					type: "call",
					data: {
						methodName: "write",
						args: ["/path/to/file.txt", "Hello, world!"],
					},
				},
			]);
		});

		it("should reject a promise when the file path is not a string", () => {
			const hfs = new Hfs({
				impl: {
					write() {
						return undefined;
					},
				},
			});

			assert.rejects(
				hfs.write(123, "Hello, world!"),
				new TypeError("File path must be a non-empty string."),
			);
		});

		it("should reject a promise when the file path is empty", () => {
			const hfs = new Hfs({
				impl: {
					write() {
						return undefined;
					},
				},
			});

			assert.rejects(
				hfs.write("", "Hello, world!"),
				new TypeError("File path must be a non-empty string."),
			);
		});

		it("should reject a promise when the contents are a number", () => {
			const hfs = new Hfs({
				impl: {
					write() {
						return undefined;
					},
				},
			});

			assert.rejects(
				hfs.write("/path/to/file.txt", 123),
				new TypeError("File contents must be a string or bytes."),
			);
		});
	});

	describe("isFile()", () => {
		it("should return true when the file exists", async () => {
			const hfs = new Hfs({
				impl: {
					isFile() {
						return true;
					},
				},
			});

			const result = await hfs.isFile("/path/to/file.txt");
			assert.strictEqual(result, true);
		});

		it("should return false when the file does not exist", async () => {
			const hfs = new Hfs({
				impl: {
					isFile() {
						return false;
					},
				},
			});

			const result = await hfs.isFile("/path/to/file.txt");
			assert.strictEqual(result, false);
		});

		it("should log the method call", async () => {
			const hfs = new Hfs({
				impl: {
					isFile() {
						return true;
					},
				},
			});

			hfs.logStart("isFile");
			await hfs.isFile("/path/to/file.txt");
			const logs = hfs.logEnd("isFile").map(normalizeLogEntry);
			assert.deepStrictEqual(logs, [
				{
					type: "call",
					data: {
						methodName: "isFile",
						args: ["/path/to/file.txt"],
					},
				},
			]);
		});

		it("should reject a promise when the file path is not a string", () => {
			const hfs = new Hfs({
				impl: {
					isFile() {
						return true;
					},
				},
			});

			assert.rejects(
				hfs.isFile(123),
				new TypeError("File path must be a non-empty string."),
			);
		});

		it("should reject a promise when the file path is empty", () => {
			const hfs = new Hfs({
				impl: {
					isFile() {
						return true;
					},
				},
			});

			assert.rejects(
				hfs.isFile(""),
				new TypeError("File path must be a non-empty string."),
			);
		});
	});

	describe("isDirectory()", () => {
		it("should return true when the directory exists", async () => {
			const hfs = new Hfs({
				impl: {
					isDirectory() {
						return true;
					},
				},
			});

			const result = await hfs.isDirectory("/path/to/dir");
			assert.strictEqual(result, true);
		});

		it("should return false when the directory does not exist", async () => {
			const hfs = new Hfs({
				impl: {
					isDirectory() {
						return false;
					},
				},
			});

			const result = await hfs.isDirectory("/path/to/dir");
			assert.strictEqual(result, false);
		});

		it("should log the method call", async () => {
			const hfs = new Hfs({
				impl: {
					isDirectory() {
						return true;
					},
				},
			});

			hfs.logStart("isDirectory");
			await hfs.isDirectory("/path/to/dir");
			const logs = hfs.logEnd("isDirectory").map(normalizeLogEntry);
			assert.deepStrictEqual(logs, [
				{
					type: "call",
					data: {
						methodName: "isDirectory",
						args: ["/path/to/dir"],
					},
				},
			]);
		});

		it("should reject a promise when the directory path is not a string", () => {
			const hfs = new Hfs({
				impl: {
					isDirectory() {
						return true;
					},
				},
			});

			assert.rejects(
				hfs.isDirectory(123),
				/Path must be a non-empty string./,
			);
		});

		it("should reject a promise when the directory path is empty", () => {
			const hfs = new Hfs({
				impl: {
					isDirectory() {
						return true;
					},
				},
			});

			assert.rejects(
				hfs.isDirectory(""),
				/Path must be a non-empty string./,
			);
		});
	});

	describe("createDirectory()", () => {
		it("should not reject a promise when the directory path is a string", async () => {
			const hfs = new Hfs({
				impl: {
					createDirectory() {
						return undefined;
					},
				},
			});

			await hfs.createDirectory("/path/to/dir");
		});

		it("should log the method call", async () => {
			const hfs = new Hfs({
				impl: {
					createDirectory() {
						return undefined;
					},
				},
			});

			hfs.logStart("createDirectory");
			await hfs.createDirectory("/path/to/dir");
			const logs = hfs.logEnd("createDirectory").map(normalizeLogEntry);
			assert.deepStrictEqual(logs, [
				{
					type: "call",
					data: {
						methodName: "createDirectory",
						args: ["/path/to/dir"],
					},
				},
			]);
		});

		it("should reject a promise when the directory path is not a string", () => {
			const hfs = new Hfs({
				impl: {
					createDirectory() {
						return undefined;
					},
				},
			});

			assert.rejects(
				hfs.createDirectory(123),
				/Path must be a non-empty string./,
			);
		});

		it("should reject a promise when the directory path is empty", () => {
			const hfs = new Hfs({
				impl: {
					createDirectory() {
						return undefined;
					},
				},
			});

			assert.rejects(
				hfs.createDirectory(""),
				/Path must be a non-empty string./,
			);
		});
	});

	describe("delete()", () => {
		it("should not reject a promise when the file path is a string", async () => {
			const hfs = new Hfs({
				impl: {
					delete() {
						return undefined;
					},
				},
			});

			await hfs.delete("/path/to/file.txt");
		});

		it("should log the method call", async () => {
			const hfs = new Hfs({
				impl: {
					delete() {
						return undefined;
					},
				},
			});

			hfs.logStart("delete");
			await hfs.delete("/path/to/file.txt");
			const logs = hfs.logEnd("delete").map(normalizeLogEntry);
			assert.deepStrictEqual(logs, [
				{
					type: "call",
					data: {
						methodName: "delete",
						args: ["/path/to/file.txt"],
					},
				},
			]);
		});

		it("should reject a promise when the file path is not a string", () => {
			const hfs = new Hfs({
				impl: {
					delete() {
						return undefined;
					},
				},
			});

			assert.rejects(
				hfs.delete(123),
				new TypeError("File path must be a non-empty string."),
			);
		});

		it("should reject a promise when the file path is empty", () => {
			const hfs = new Hfs({
				impl: {
					delete() {
						return undefined;
					},
				},
			});

			assert.rejects(
				hfs.delete(""),
				new TypeError("File path must be a non-empty string."),
			);
		});
	});

	describe("deleteAll()", () => {
		it("should not reject a promise when the file path is a string", async () => {
			const hfs = new Hfs({
				impl: {
					delete() {
						return undefined;
					},
				},
			});

			await hfs.delete("/path/to/directory");
		});

		it("should log the method call", async () => {
			const hfs = new Hfs({
				impl: {
					deleteAll() {
						return undefined;
					},
				},
			});

			hfs.logStart("delete");
			await hfs.deleteAll("/path/to/directory");
			const logs = hfs.logEnd("delete").map(normalizeLogEntry);
			assert.deepStrictEqual(logs, [
				{
					type: "call",
					data: {
						methodName: "deleteAll",
						args: ["/path/to/directory"],
					},
				},
			]);
		});

		it("should reject a promise when the file path is not a string", () => {
			const hfs = new Hfs({
				impl: {
					deleteAll() {
						return undefined;
					},
				},
			});

			assert.rejects(
				hfs.deleteAll(123),
				/Path must be a non-empty string./,
			);
		});

		it("should reject a promise when the file path is empty", () => {
			const hfs = new Hfs({
				impl: {
					deleteAll() {
						return undefined;
					},
				},
			});

			assert.rejects(
				hfs.deleteAll(""),
				/Path must be a non-empty string./,
			);
		});
	});

	describe("list()", () => {
		it("should return the list of files", async () => {
			const data = [
				{
					name: "file1.txt",
					isFile: true,
					isDirectory: false,
					isSymlink: false,
				},
				{
					name: "file2.txt",
					isFile: true,
					isDirectory: false,
					isSymlink: false,
				},
				{
					name: "file3.txt",
					isFile: true,
					isDirectory: false,
					isSymlink: false,
				},
				{
					name: "subdir",
					isFile: false,
					isDirectory: true,
					isSymlink: false,
				},
			];

			const hfs = new Hfs({
				impl: {
					list() {
						return data;
					},
				},
			});

			const result = await hfs.list("/path/to/dir");
			assert.ok(
				result[Symbol.asyncIterator],
				"list() should return an AsyncIterable.",
			);

			const entries = [];
			for await (const entry of result) {
				entries.push(entry);
			}

			assert.strictEqual(entries.length, data.length);

			for (const entry of data) {
				const item = entries.find(item => item.name === entry.name);
				assert.ok(item, `Could not find item with name ${entry.name}.`);

				assert.strictEqual(item.isDirectory, entry.isDirectory);
				assert.strictEqual(item.isFile, entry.isFile);
				assert.strictEqual(item.isSymlink, entry.isSymlink);
			}
		});
	});

	describe("size()", () => {
		it("should return the size of the file", async () => {
			const hfs = new Hfs({
				impl: {
					size() {
						return 123;
					},
				},
			});

			const result = await hfs.size("/path/to/file.txt");
			assert.strictEqual(result, 123);
		});

		it("should log the method call", async () => {
			const hfs = new Hfs({
				impl: {
					size() {
						return 123;
					},
				},
			});

			hfs.logStart("size");
			await hfs.size("/path/to/file.txt");
			const logs = hfs.logEnd("size").map(normalizeLogEntry);
			assert.deepStrictEqual(logs, [
				{
					type: "call",
					data: {
						methodName: "size",
						args: ["/path/to/file.txt"],
					},
				},
			]);
		});

		it("should reject a promise when the file path is not a string", () => {
			const hfs = new Hfs({
				impl: {
					size() {
						return 123;
					},
				},
			});

			assert.rejects(
				hfs.size(123),
				new TypeError("File path must be a non-empty string."),
			);
		});

		it("should reject a promise when the file path is empty", () => {
			const hfs = new Hfs({
				impl: {
					size() {
						return 123;
					},
				},
			});

			assert.rejects(
				hfs.size(""),
				new TypeError("File path must be a non-empty string."),
			);
		});
	});
});
