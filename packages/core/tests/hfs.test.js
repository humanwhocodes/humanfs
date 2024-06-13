/**
 * @fileoverview Tests for the Hfs class.
 * @author Nicholas C. Zakas
 */
/* global it, describe, beforeEach, URL, TextEncoder */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import {
	Hfs,
	NoSuchMethodError,
	ImplAlreadySetError,
	MethodNotSupportedError,
} from "../src/hfs.js";
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

const encoder = new TextEncoder();

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe("Hfs", () => {
	describe("Missing Methods", () => {
		["text", "json", "arrayBuffer"].forEach(methodName => {
			it(`should reject a promise when the ${methodName}() method is not present on the impl`, () => {
				const hfs = new Hfs({ impl: {} });

				return assert.rejects(
					hfs[methodName]("/path/to/file.txt"),
					new MethodNotSupportedError(methodName),
				);
			});
		});

		["bytes"].forEach(methodName => {
			it(`should reject a promise when the ${methodName}() method is not present on the impl`, () => {
				const hfs = new Hfs({ impl: {} });

				return assert.rejects(
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
				bytes() {
					return encoder.encode("Hello, world!");
				},
			};

			hfs.setImpl(impl1);

			const result = await hfs.text("/path/to/file.txt");
			assert.strictEqual(result, "Hello, world!");
		});

		it("should change the impl back when resetImpl() is called", async () => {
			const hfs = new Hfs({ impl: {} });
			const impl1 = {
				bytes() {
					return encoder.encode("Hello, world!");
				},
			};

			hfs.setImpl(impl1);

			const result = await hfs.text("/path/to/file.txt");
			assert.strictEqual(result, "Hello, world!");

			hfs.resetImpl();

			return assert.rejects(
				hfs.text("/path/to/file.txt"),
				new MethodNotSupportedError("text"),
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
					bytes() {
						return encoder.encode("Hello, world!");
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
					bytes() {
						return encoder.encode("Hello, world!");
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

	describe("text()", () => {
		it("should return the text from the file with a string filePath", async () => {
			const hfs = new Hfs({
				impl: {
					bytes() {
						return encoder.encode("Hello, world!");
					},
				},
			});

			const result = await hfs.text("/path/to/file.txt");
			assert.strictEqual(result, "Hello, world!");
		});

		it("should return the text from the file with a URL filePath", async () => {
			const hfs = new Hfs({
				impl: {
					bytes() {
						return encoder.encode("Hello, world!");
					},
				},
			});

			const result = await hfs.text(
				new URL("http://example.com/file.txt"),
			);
			assert.strictEqual(result, "Hello, world!");
		});

		it("should log the method call", async () => {
			const hfs = new Hfs({
				impl: {
					bytes() {
						return encoder.encode("Hello, world!");
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

		it("should reject a promise when the file path is not a string or URL", () => {
			const hfs = new Hfs({
				impl: {
					bytes() {
						return encoder.encode("Hello, world!");
					},
				},
			});

			return assert.rejects(
				hfs.text(123),
				new TypeError("Path must be a non-empty string or URL."),
			);
		});

		it("should reject a promise when the file path is empty", () => {
			const hfs = new Hfs({
				impl: {
					bytes() {
						return encoder.encode("Hello, world!");
					},
				},
			});

			return assert.rejects(
				hfs.text(""),
				new TypeError("Path must be a non-empty string or URL."),
			);
		});
	});

	describe("json()", () => {
		it("should return the JSON from the file with a string filePath", async () => {
			const hfs = new Hfs({
				impl: {
					bytes() {
						return encoder.encode(JSON.stringify({ foo: "bar" }));
					},
				},
			});

			const result = await hfs.json("/path/to/file.txt");
			assert.deepStrictEqual(result, { foo: "bar" });
		});

		it("should return the JSON from the file with a URL filePath", async () => {
			const hfs = new Hfs({
				impl: {
					bytes() {
						return encoder.encode(JSON.stringify({ foo: "bar" }));
					},
				},
			});

			const result = await hfs.json(
				new URL("http://example.com/file.txt"),
			);
			assert.deepStrictEqual(result, { foo: "bar" });
		});

		it("should log the method call", async () => {
			const hfs = new Hfs({
				impl: {
					bytes() {
						return encoder.encode(JSON.stringify({ foo: "bar" }));
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
					bytes() {
						return encoder.encode(JSON.stringify({ foo: "bar" }));
					},
				},
			});

			return assert.rejects(
				hfs.json(123),
				new TypeError("Path must be a non-empty string or URL."),
			);
		});

		it("should reject a promise when the file path is empty", () => {
			const hfs = new Hfs({
				impl: {
					bytes() {
						return encoder.encode(JSON.stringify({ foo: "bar" }));
					},
				},
			});

			return assert.rejects(
				hfs.json(""),
				new TypeError("Path must be a non-empty string or URL."),
			);
		});
	});

	describe("arrayBuffer", () => {
		it("should return the bytes from the file with a string filePath", async () => {
			const hfs = new Hfs({
				impl: {
					bytes() {
						return new Uint8Array([1, 2, 3]);
					},
				},
			});

			const result = await hfs.arrayBuffer("/path/to/file.txt");
			assert.deepStrictEqual(result, new Uint8Array([1, 2, 3]).buffer);
		});

		it("should return the bytes from the file with a URL filePath", async () => {
			const hfs = new Hfs({
				impl: {
					bytes() {
						return new Uint8Array([1, 2, 3]);
					},
				},
			});

			const result = await hfs.arrayBuffer(
				new URL("http://example.com/file.txt"),
			);
			assert.deepStrictEqual(result, new Uint8Array([1, 2, 3]).buffer);
		});

		it("should log the method call", async () => {
			const hfs = new Hfs({
				impl: {
					bytes() {
						return new Uint8Array([1, 2, 3]);
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
					bytes() {
						return new Uint8Array([1, 2, 3]);
					},
				},
			});

			return assert.rejects(
				hfs.arrayBuffer(123),
				/Path must be a non-empty string/,
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

			return assert.rejects(
				hfs.arrayBuffer(""),
				/Path must be a non-empty string/,
			);
		});
	});

	describe("bytes", () => {
		it("should return the bytes from the file with a string filePath", async () => {
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

		it("should return the bytes from the file with a URL filePath", async () => {
			const hfs = new Hfs({
				impl: {
					bytes() {
						return new Uint8Array([1, 2, 3]).buffer;
					},
				},
			});

			const result = await hfs.bytes(
				new URL("http://example.com/file.txt"),
			);
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

			return assert.rejects(
				hfs.bytes(123),
				new TypeError("Path must be a non-empty string or URL."),
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

			return assert.rejects(
				hfs.bytes(""),
				new TypeError("Path must be a non-empty string or URL."),
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

			return assert.rejects(
				hfs.bytes(123),
				new TypeError("Path must be a non-empty string or URL."),
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

			return assert.rejects(
				hfs.bytes(""),
				new TypeError("Path must be a non-empty string or URL."),
			);
		});
	});

	describe("append()", () => {
		it("should not reject a promise when the value to write is a string", async () => {
			const hfs = new Hfs({
				impl: {
					append() {
						return undefined;
					},
				},
			});

			await hfs.append("/path/to/file.txt", "Hello, world!");
		});

		it("should not reject a promise when the value to write is an ArayBuffer", async () => {
			const hfs = new Hfs({
				impl: {
					append() {
						return undefined;
					},
				},
			});

			await hfs.append(
				"/path/to/file.txt",
				new Uint8Array([1, 2, 3]).buffer,
			);
		});

		it("should not reject a promise when the value to write is a Uint8Array", async () => {
			const hfs = new Hfs({
				impl: {
					append() {
						return undefined;
					},
				},
			});

			await hfs.append("/path/to/file.txt", new Uint8Array([1, 2, 3]));
		});

		it("should log the method call", async () => {
			const hfs = new Hfs({
				impl: {
					append() {
						return undefined;
					},
				},
			});

			hfs.logStart("append");
			await hfs.append("/path/to/file.txt", "Hello, world!");
			const logs = hfs.logEnd("append").map(normalizeLogEntry);
			assert.deepStrictEqual(logs, [
				{
					type: "call",
					data: {
						methodName: "append",
						args: ["/path/to/file.txt", "Hello, world!"],
					},
				},
			]);
		});

		it("should reject a promise when the file path is not a string", () => {
			const hfs = new Hfs({
				impl: {
					append() {
						return undefined;
					},
				},
			});

			return assert.rejects(
				hfs.append(123, "Hello, world!"),
				new TypeError("Path must be a non-empty string or URL."),
			);
		});

		it("should reject a promise when the file path is empty", () => {
			const hfs = new Hfs({
				impl: {
					append() {
						return undefined;
					},
				},
			});

			return assert.rejects(
				hfs.append("", "Hello, world!"),
				new TypeError("Path must be a non-empty string or URL."),
			);
		});

		it("should reject a promise when the contents are a number", () => {
			const hfs = new Hfs({
				impl: {
					append() {
						return undefined;
					},
				},
			});

			return assert.rejects(
				hfs.append("/path/to/file.txt", 123),
				new TypeError(
					"File contents must be a string, ArrayBuffer, or ArrayBuffer view.",
				),
			);
		});

		it("should pass a Uint8Array to the impl method when text is passed", async () => {
			const hfs = new Hfs({
				impl: {
					append(path, contents) {
						assert.ok(contents instanceof Uint8Array);
					},
				},
			});

			await hfs.append("/path/to/file.txt", "Hello, world!");
		});

		it("should pass a Uint8Array to the impl method when an ArrayBuffer is passed", async () => {
			const hfs = new Hfs({
				impl: {
					append(path, contents) {
						assert.ok(contents instanceof Uint8Array);
					},
				},
			});

			await hfs.append(
				"/path/to/file.txt",
				new Uint8Array([1, 2, 3]).buffer,
			);
		});

		it("should pass a Uint8Array to the impl method when a Uint8Array is passed", async () => {
			const hfs = new Hfs({
				impl: {
					append(path, contents) {
						assert.ok(contents instanceof Uint8Array);
					},
				},
			});

			await hfs.append("/path/to/file.txt", new Uint8Array([1, 2, 3]));
		});

		it("should pass a Uint8Array to the impl method when a DataView is passed", async () => {
			const hfs = new Hfs({
				impl: {
					append(path, contents) {
						assert.ok(contents instanceof Uint8Array);
					},
				},
			});

			await hfs.append(
				"/path/to/file.txt",
				new DataView(new Uint8Array([1, 2, 3]).buffer),
			);
		});

		it("should pass a Uint8Array to the impl method when a Uint8Array subarray is passed", async () => {
			const hfs = new Hfs({
				impl: {
					append(path, contents) {
						assert.ok(contents instanceof Uint8Array);
						assert.strictEqual(contents.byteLength, 2);
						assert.deepStrictEqual(
							contents,
							new Uint8Array([2, 3]),
						);
					},
				},
			});

			await hfs.append(
				"/path/to/file.txt",
				new Uint8Array([1, 2, 3]).subarray(1),
			);
		});
	});

	describe("append()", () => {
		it("should not reject a promise when the value to write is a string", async () => {
			const hfs = new Hfs({
				impl: {
					append() {
						return undefined;
					},
				},
			});

			await hfs.append("/path/to/file.txt", "Hello, world!");
		});

		it("should not reject a promise when the value to write is an ArayBuffer", async () => {
			const hfs = new Hfs({
				impl: {
					append() {
						return undefined;
					},
				},
			});

			await hfs.append(
				"/path/to/file.txt",
				new Uint8Array([1, 2, 3]).buffer,
			);
		});

		it("should not reject a promise when the value to write is a Uint8Array", async () => {
			const hfs = new Hfs({
				impl: {
					append() {
						return undefined;
					},
				},
			});

			await hfs.append("/path/to/file.txt", new Uint8Array([1, 2, 3]));
		});

		it("should log the method call", async () => {
			const hfs = new Hfs({
				impl: {
					append() {
						return undefined;
					},
				},
			});

			hfs.logStart("append");
			await hfs.append("/path/to/file.txt", "Hello, world!");
			const logs = hfs.logEnd("append").map(normalizeLogEntry);
			assert.deepStrictEqual(logs, [
				{
					type: "call",
					data: {
						methodName: "append",
						args: ["/path/to/file.txt", "Hello, world!"],
					},
				},
			]);
		});

		it("should reject a promise when the file path is not a string or URL", () => {
			const hfs = new Hfs({
				impl: {
					append() {
						return undefined;
					},
				},
			});

			return assert.rejects(
				hfs.append(123, "Hello, world!"),
				new TypeError("Path must be a non-empty string or URL."),
			);
		});

		it("should reject a promise when the file path is empty", () => {
			const hfs = new Hfs({
				impl: {
					append() {
						return undefined;
					},
				},
			});

			return assert.rejects(
				hfs.append("", "Hello, world!"),
				new TypeError("Path must be a non-empty string or URL."),
			);
		});

		it("should reject a promise when the contents are a number", () => {
			const hfs = new Hfs({
				impl: {
					append() {
						return undefined;
					},
				},
			});

			return assert.rejects(
				hfs.append("/path/to/file.txt", 123),
				new TypeError(
					"File contents must be a string, ArrayBuffer, or ArrayBuffer view.",
				),
			);
		});

		it("should pass a Uint8Array to the impl method when text is passed", async () => {
			const hfs = new Hfs({
				impl: {
					append(path, contents) {
						assert.ok(contents instanceof Uint8Array);
					},
				},
			});

			await hfs.append("/path/to/file.txt", "Hello, world!");
		});

		it("should pass a Uint8Array to the impl method when an ArrayBuffer is passed", async () => {
			const hfs = new Hfs({
				impl: {
					append(path, contents) {
						assert.ok(contents instanceof Uint8Array);
					},
				},
			});

			await hfs.append(
				"/path/to/file.txt",
				new Uint8Array([1, 2, 3]).buffer,
			);
		});

		it("should pass a Uint8Array to the impl method when a Uint8Array is passed", async () => {
			const hfs = new Hfs({
				impl: {
					append(path, contents) {
						assert.ok(contents instanceof Uint8Array);
					},
				},
			});

			await hfs.append("/path/to/file.txt", new Uint8Array([1, 2, 3]));
		});

		it("should pass a Uint8Array to the impl method when a DataView is passed", async () => {
			const hfs = new Hfs({
				impl: {
					append(path, contents) {
						assert.ok(contents instanceof Uint8Array);
					},
				},
			});

			await hfs.append(
				"/path/to/file.txt",
				new DataView(new Uint8Array([1, 2, 3]).buffer),
			);
		});

		it("should pass a Uint8Array to the impl method when a Uint8Array subarray is passed", async () => {
			const hfs = new Hfs({
				impl: {
					append(path, contents) {
						assert.ok(contents instanceof Uint8Array);
						assert.strictEqual(contents.byteLength, 2);
						assert.deepStrictEqual(
							contents,
							new Uint8Array([2, 3]),
						);
					},
				},
			});

			await hfs.append(
				"/path/to/file.txt",
				new Uint8Array([1, 2, 3]).subarray(1),
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

			return assert.rejects(
				hfs.isFile(123),
				new TypeError("Path must be a non-empty string or URL."),
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

			return assert.rejects(
				hfs.isFile(""),
				new TypeError("Path must be a non-empty string or URL."),
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

			return assert.rejects(
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

			return assert.rejects(
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

			return assert.rejects(
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

			return assert.rejects(
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

			return assert.rejects(
				hfs.delete(123),
				new TypeError("Path must be a non-empty string or URL."),
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

			return assert.rejects(
				hfs.delete(""),
				new TypeError("Path must be a non-empty string or URL."),
			);
		});

		it("should return true when the impl method returns true", async () => {
			const hfs = new Hfs({
				impl: {
					delete() {
						return true;
					},
				},
			});

			const result = await hfs.delete("/path/to/file.txt");
			assert.strictEqual(result, true);
		});

		it("should return false when the impl method returns false", async () => {
			const hfs = new Hfs({
				impl: {
					delete() {
						return false;
					},
				},
			});

			const result = await hfs.delete("/path/to/file.txt");
			assert.strictEqual(result, false);
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

			return assert.rejects(
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

			return assert.rejects(
				hfs.deleteAll(""),
				/Path must be a non-empty string./,
			);
		});

		it("should return true when the impl method returns true", async () => {
			const hfs = new Hfs({
				impl: {
					deleteAll() {
						return true;
					},
				},
			});

			const result = await hfs.deleteAll("/path/to/directory");
			assert.strictEqual(result, true);
		});

		it("should return false when the impl method returns false", async () => {
			const hfs = new Hfs({
				impl: {
					deleteAll() {
						return false;
					},
				},
			});

			const result = await hfs.deleteAll("/path/to/directory");
			assert.strictEqual(result, false);
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

	describe("walk()", () => {
		const data = {
			"/path/to/dir": [
				{
					name: "subdir1",
					isFile: false,
					isDirectory: true,
					isSymlink: false,
				},
				{
					name: "subdir2",
					isFile: false,
					isDirectory: true,
					isSymlink: false,
				},
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
			],
			"/path/to/dir/subdir1": [
				{
					name: "subdir3",
					isFile: false,
					isDirectory: true,
					isSymlink: false,
				},
				{
					name: "file4.txt",
					isFile: true,
					isDirectory: false,
					isSymlink: false,
				},
				{
					name: "file5.txt",
					isFile: true,
					isDirectory: false,
					isSymlink: false,
				},
			],
			"/path/to/dir/subdir1/subdir3": [
				{
					name: "file6.txt",
					isFile: true,
					isDirectory: false,
					isSymlink: false,
				},
			],
			"/path/to/dir/subdir2": [
				{
					name: "file7.txt",
					isFile: true,
					isDirectory: false,
					isSymlink: false,
				},
			],
		};

		const traversed = [
			{
				path: "subdir1",
				name: "subdir1",
				isFile: false,
				isDirectory: true,
				isSymlink: false,
			},
			{
				path: "subdir1/subdir3",
				name: "subdir3",
				isFile: false,
				isDirectory: true,
				isSymlink: false,
			},
			{
				path: "subdir1/subdir3/file6.txt",
				name: "file6.txt",
				isFile: true,
				isDirectory: false,
				isSymlink: false,
			},
			{
				path: "subdir1/file4.txt",
				name: "file4.txt",
				isFile: true,
				isDirectory: false,
				isSymlink: false,
			},
			{
				path: "subdir1/file5.txt",
				name: "file5.txt",
				isFile: true,
				isDirectory: false,
				isSymlink: false,
			},
			{
				path: "subdir2",
				name: "subdir2",
				isFile: false,
				isDirectory: true,
				isSymlink: false,
			},
			{
				path: "subdir2/file7.txt",
				name: "file7.txt",
				isFile: true,
				isDirectory: false,
				isSymlink: false,
			},
			{
				path: "file1.txt",
				name: "file1.txt",
				isFile: true,
				isDirectory: false,
				isSymlink: false,
			},
			{
				path: "file2.txt",
				name: "file2.txt",
				isFile: true,
				isDirectory: false,
				isSymlink: false,
			},
			{
				path: "file3.txt",
				name: "file3.txt",
				isFile: true,
				isDirectory: false,
				isSymlink: false,
			},
		];

		let hfs;

		beforeEach(() => {
			hfs = new Hfs({
				impl: {
					list(dirPath) {
						if (dirPath instanceof URL) {
							dirPath = dirPath.pathname;
						}

						if (dirPath.endsWith("/")) {
							dirPath = dirPath.slice(0, -1);
						}

						return data[dirPath] ?? [];
					},
				},
			});
		});

		it("should log the method call", async () => {
			hfs.logStart("walk");
			const directoryFilter = () => false;
			const entryFilter = () => false;

			// eslint-disable-next-line no-unused-vars -- Needed for async iteration
			for await (const entry of hfs.walk("/path/to/dir", {
				directoryFilter,
				entryFilter,
			}));
			const logs = hfs.logEnd("walk").map(normalizeLogEntry);
			assert.deepStrictEqual(logs, [
				{
					type: "call",
					data: {
						methodName: "walk",
						args: [
							"/path/to/dir",
							{ directoryFilter, entryFilter },
						],
					},
				},
			]);
		});

		it("should reject a promise when the directory path is not a string", () => {
			return assert.rejects(
				async () => hfs.walk(123).next(),
				new TypeError("Path must be a non-empty string or URL."),
			);
		});

		it("should reject a promise when the directory path is empty", () => {
			return assert.rejects(
				async () => hfs.walk("").next(),
				new TypeError("Path must be a non-empty string or URL."),
			);
		});

		it("should return the list of files and directories", async () => {
			const result = await hfs.walk("/path/to/dir");
			assert.ok(
				result[Symbol.asyncIterator],
				"walk() should return an AsyncIterable.",
			);

			const entries = [];
			for await (const entry of result) {
				entries.push(entry);
			}

			assert.deepStrictEqual(entries, traversed);
		});

		it("should return the list of files and directories when passed a URL without a trailing slash", async () => {
			const result = await hfs.walk(new URL("file:///path/to/dir"));
			assert.ok(
				result[Symbol.asyncIterator],
				"walk() should return an AsyncIterable.",
			);

			const entries = [];
			for await (const entry of result) {
				entries.push(entry);
			}

			assert.deepStrictEqual(entries, traversed);
		});

		it("should return the list of files and directories when passed a URL with a trailing slash", async () => {
			const result = await hfs.walk(new URL("file:///path/to/dir/"));
			assert.ok(
				result[Symbol.asyncIterator],
				"walk() should return an AsyncIterable.",
			);

			const entries = [];
			for await (const entry of result) {
				entries.push(entry);
			}

			assert.deepStrictEqual(entries, traversed);
		});

		it("should return only files when the entryFilter filters on isFile synchronously", async () => {
			const result = await hfs.walk("/path/to/dir", {
				entryFilter(entry) {
					return entry.isFile;
				},
			});

			const entries = [];
			for await (const entry of result) {
				entries.push(entry);
			}

			assert.deepStrictEqual(
				entries,
				traversed.filter(entry => entry.isFile),
			);
		});

		it("should return only files when the entryFilter filters on isFile asynchronously", async () => {
			const result = await hfs.walk("/path/to/dir", {
				async entryFilter(entry) {
					return entry.isFile;
				},
			});

			const entries = [];
			for await (const entry of result) {
				entries.push(entry);
			}

			assert.deepStrictEqual(
				entries,
				traversed.filter(entry => entry.isFile),
			);
		});

		it("should return only the top-level entries when the directoryFilter return false synchronously", async () => {
			const result = await hfs.walk("/path/to/dir", {
				directoryFilter() {
					return false;
				},
			});

			const entries = [];
			for await (const entry of result) {
				entries.push(entry);
			}

			const expected = traversed.filter(entry =>
				data["/path/to/dir"].find(e => e.name === entry.name),
			);
			assert.deepStrictEqual(entries, expected);
		});

		it("should return only the top-level entries when the directoryFilter return false asynchronously", async () => {
			const result = await hfs.walk("/path/to/dir", {
				async directoryFilter() {
					return false;
				},
			});

			const entries = [];
			for await (const entry of result) {
				entries.push(entry);
			}

			const expected = traversed.filter(entry =>
				data["/path/to/dir"].find(e => e.name === entry.name),
			);
			assert.deepStrictEqual(entries, expected);
		});

		it("should skip subdir3 only when the directoryFilter return false synchronously", async () => {
			const result = await hfs.walk("/path/to/dir", {
				directoryFilter(entry) {
					return entry.name !== "subdir3";
				},
			});

			const entries = [];
			for await (const entry of result) {
				entries.push(entry);
			}

			const expected = traversed.filter(
				entry => !entry.path.includes("subdir3/"),
			);
			assert.deepStrictEqual(entries, expected);
		});

		it("should pass deep entries to the directoryFilter", async () => {
			const deepEntries = [];
			const result = await hfs.walk("/path/to/dir", {
				directoryFilter(entry) {
					deepEntries.push(entry.path);
					return true;
				},
			});

			const entries = [];
			for await (const entry of result) {
				entries.push(entry);
			}

			const expected = traversed
				.filter(entry => entry.isDirectory)
				.map(entry => entry.path);
			assert.deepStrictEqual(deepEntries, expected);
		});

		it("should pass deep entries to the entryFilter", async () => {
			const deepEntries = [];
			const result = await hfs.walk("/path/to/dir", {
				entryFilter(entry) {
					deepEntries.push(entry.path);
					return true;
				},
			});

			const entries = [];
			for await (const entry of result) {
				entries.push(entry);
			}

			const expected = traversed.map(entry => entry.path);
			assert.deepStrictEqual(deepEntries, expected);
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

			return assert.rejects(
				hfs.size(123),
				new TypeError("Path must be a non-empty string or URL."),
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

			return assert.rejects(
				hfs.size(""),
				new TypeError("Path must be a non-empty string or URL."),
			);
		});
	});

	describe("lastModified()", () => {
		it("should return the last modified time of the file", async () => {
			const hfs = new Hfs({
				impl: {
					lastModified() {
						return new Date(123);
					},
				},
			});

			const result = await hfs.lastModified("/path/to/file.txt");
			assert.deepStrictEqual(result, new Date(123));
		});

		it("should log the method call", async () => {
			const hfs = new Hfs({
				impl: {
					lastModified() {
						return new Date(123);
					},
				},
			});

			hfs.logStart("lastModified");
			await hfs.lastModified("/path/to/file.txt");
			const logs = hfs.logEnd("lastModified").map(normalizeLogEntry);
			assert.deepStrictEqual(logs, [
				{
					type: "call",
					data: {
						methodName: "lastModified",
						args: ["/path/to/file.txt"],
					},
				},
			]);
		});

		it("should reject a promise when the file path is not a string or URL", () => {
			const hfs = new Hfs({
				impl: {
					lastModified() {
						return new Date(123);
					},
				},
			});

			return assert.rejects(
				hfs.lastModified(123),
				new TypeError("Path must be a non-empty string or URL."),
			);
		});

		it("should reject a promise when the file path is empty", () => {
			const hfs = new Hfs({
				impl: {
					lastModified() {
						return new Date(123);
					},
				},
			});

			return assert.rejects(
				hfs.lastModified(""),
				new TypeError("Path must be a non-empty string or URL."),
			);
		});
	});

	describe("copy()", () => {
		it("should not reject a promise when the source and destination are strings", async () => {
			const hfs = new Hfs({
				impl: {
					copy() {
						return undefined;
					},
				},
			});

			await hfs.copy("/path/to/file.txt", "/path/to/other/file.txt");
		});

		it("should log the method call", async () => {
			const hfs = new Hfs({
				impl: {
					copy() {
						return undefined;
					},
				},
			});

			hfs.logStart("copy");
			await hfs.copy("/path/to/file.txt", "/path/to/other/file.txt");
			const logs = hfs.logEnd("copy").map(normalizeLogEntry);
			assert.deepStrictEqual(logs, [
				{
					type: "call",
					data: {
						methodName: "copy",
						args: ["/path/to/file.txt", "/path/to/other/file.txt"],
					},
				},
			]);
		});

		it("should reject a promise when the source path is not a string", () => {
			const hfs = new Hfs({
				impl: {
					copy() {
						return undefined;
					},
				},
			});

			return assert.rejects(
				hfs.copy(123, "/path/to/other/file.txt"),
				new TypeError("Path must be a non-empty string or URL."),
			);
		});

		it("should reject a promise when the source path is empty", () => {
			const hfs = new Hfs({
				impl: {
					copy() {
						return undefined;
					},
				},
			});

			return assert.rejects(
				hfs.copy("", "/path/to/other/file.txt"),
				new TypeError("Path must be a non-empty string or URL."),
			);
		});

		it("should reject a promise when the destination path is not a string or URL", () => {
			const hfs = new Hfs({
				impl: {
					copy() {
						return undefined;
					},
				},
			});

			return assert.rejects(
				hfs.copy("/path/to/file.txt", 123),
				new TypeError("Path must be a non-empty string or URL."),
			);
		});

		it("should reject a promise when the destination path is empty", () => {
			const hfs = new Hfs({
				impl: {
					copy() {
						return undefined;
					},
				},
			});

			return assert.rejects(
				hfs.copy("/path/to/file.txt", ""),
				new TypeError("Path must be a non-empty string or URL."),
			);
		});
	});

	describe("copyAll()", () => {
		it("should not reject a promise when the source and destination are strings", async () => {
			const hfs = new Hfs({
				impl: {
					copyAll() {
						return undefined;
					},
				},
			});

			await hfs.copyAll("/path/to/dir", "/path/to/other/dir");
		});

		it("should log the method call", async () => {
			const hfs = new Hfs({
				impl: {
					copyAll() {
						return undefined;
					},
				},
			});

			hfs.logStart("copyAll");
			await hfs.copyAll("/path/to/dir", "/path/to/other/dir");
			const logs = hfs.logEnd("copyAll").map(normalizeLogEntry);
			assert.deepStrictEqual(logs, [
				{
					type: "call",
					data: {
						methodName: "copyAll",
						args: ["/path/to/dir", "/path/to/other/dir"],
					},
				},
			]);
		});

		it("should reject a promise when the source path is not a string", () => {
			const hfs = new Hfs({
				impl: {
					copyAll() {
						return undefined;
					},
				},
			});

			return assert.rejects(
				hfs.copyAll(123, "/path/to/other/dir"),
				new TypeError("Path must be a non-empty string or URL."),
			);
		});

		it("should reject a promise when the source path is empty", () => {
			const hfs = new Hfs({
				impl: {
					copyAll() {
						return undefined;
					},
				},
			});

			return assert.rejects(
				hfs.copyAll("", "/path/to/other/dir"),
				new TypeError("Path must be a non-empty string or URL."),
			);
		});

		it("should reject a promise when the destination path is not a string or URL", () => {
			const hfs = new Hfs({
				impl: {
					copyAll() {
						return undefined;
					},
				},
			});

			return assert.rejects(
				hfs.copyAll("/path/to/dir", 123),
				new TypeError("Path must be a non-empty string or URL."),
			);
		});
	});

	describe("move()", () => {
		it("should call impl method", async () => {
			const hfs = new Hfs({
				impl: {
					move() {
						return undefined;
					},
				},
			});

			await hfs.move("/path/to/file.txt", "/path/to/newfile.txt");
		});

		it("should log the method call", async () => {
			const hfs = new Hfs({
				impl: {
					move() {
						return undefined;
					},
				},
			});

			hfs.logStart("move");
			await hfs.move("/path/to/file.txt", "/path/to/newfile.txt");
			const logs = hfs.logEnd("move").map(normalizeLogEntry);
			assert.deepStrictEqual(logs, [
				{
					type: "call",
					data: {
						methodName: "move",
						args: ["/path/to/file.txt", "/path/to/newfile.txt"],
					},
				},
			]);
		});

		it("should reject a promise when the file path is not a string", () => {
			const hfs = new Hfs({
				impl: {
					move() {
						return undefined;
					},
				},
			});

			return assert.rejects(
				hfs.move(123, "/path/to/newfile.txt"),
				new TypeError("Path must be a non-empty string or URL."),
			);
		});

		it("should reject a promise when the file path is empty", () => {
			const hfs = new Hfs({
				impl: {
					move() {
						return undefined;
					},
				},
			});

			return assert.rejects(
				hfs.move("", "/path/to/newfile.txt"),
				new TypeError("Path must be a non-empty string or URL."),
			);
		});

		it("should reject a promise when the new file path is not a string", () => {
			const hfs = new Hfs({
				impl: {
					move() {
						return undefined;
					},
				},
			});

			return assert.rejects(
				hfs.move("/path/to/file.txt", 123),
				new TypeError("Path must be a non-empty string or URL."),
			);
		});

		it("should reject a promise when the new file path is empty", () => {
			const hfs = new Hfs({
				impl: {
					move() {
						return undefined;
					},
				},
			});

			return assert.rejects(
				hfs.move("/path/to/file.txt", ""),
				new TypeError("Path must be a non-empty string or URL."),
			);
		});
	});

	describe("moveAll()", () => {
		it("should call impl method", async () => {
			const hfs = new Hfs({
				impl: {
					moveAll() {
						return undefined;
					},
				},
			});

			await hfs.moveAll("/path/to/dir", "/path/to/newdir");
		});

		it("should log the method call", async () => {
			const hfs = new Hfs({
				impl: {
					moveAll() {
						return undefined;
					},
				},
			});

			hfs.logStart("moveAll");
			await hfs.moveAll("/path/to/dir", "/path/to/newdir");
			const logs = hfs.logEnd("moveAll").map(normalizeLogEntry);
			assert.deepStrictEqual(logs, [
				{
					type: "call",
					data: {
						methodName: "moveAll",
						args: ["/path/to/dir", "/path/to/newdir"],
					},
				},
			]);
		});

		it("should reject a promise when the source is not a string", () => {
			const hfs = new Hfs({
				impl: {
					moveAll() {
						return undefined;
					},
				},
			});

			return assert.rejects(
				hfs.moveAll(123, "/path/to/newdir"),
				new TypeError("Path must be a non-empty string or URL."),
			);
		});

		it("should reject a promise when the source is empty", () => {
			const hfs = new Hfs({
				impl: {
					moveAll() {
						return undefined;
					},
				},
			});

			return assert.rejects(
				hfs.moveAll("", "/path/to/newdir"),
				new TypeError("Path must be a non-empty string or URL."),
			);
		});

		it("should reject a promise when the destination is not a string", () => {
			const hfs = new Hfs({
				impl: {
					moveAll() {
						return undefined;
					},
				},
			});

			return assert.rejects(
				hfs.moveAll("/path/to/dir", 123),
				new TypeError("Path must be a non-empty string or URL."),
			);
		});

		it("should reject a promise when the destination is empty", () => {
			const hfs = new Hfs({
				impl: {
					moveAll() {
						return undefined;
					},
				},
			});

			return assert.rejects(
				hfs.moveAll("/path/to/dir", ""),
				new TypeError("Path must be a non-empty string or URL."),
			);
		});
	});
});
