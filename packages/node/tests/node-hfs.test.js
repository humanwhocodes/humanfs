/**
 * @fileoverview Tests for the Hfs class.
 * @author Nicholas C. Zakas
 */

/*global describe, it, TextEncoder, Buffer */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import { NodeHfsImpl } from "../src/node-hfs.js";
import assert from "node:assert";
import fsp from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { HfsImplTester } from "@humanfs/test";

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesDir = path.resolve(__dirname, "fixtures/tmp");

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const tester = new HfsImplTester({
	outputDir: fixturesDir,
	assert,
	test: globalThis,
	expectedEntries: await fsp.readdir("."),
});

await tester.test({
	name: "NodeHfsImpl (with fsp)",
	impl: new NodeHfsImpl({ fsp }),
});

await tester.test({
	name: "NodeHfsImpl (without fsp)",
	impl: new NodeHfsImpl(),
});

describe("NodeHfsImpl Customizations", () => {
	describe("isFile()", () => {
		it("should return false when a file isn't present", async () => {
			const impl = new NodeHfsImpl({ fsp });
			const result = await impl.isFile("foo.txt");
			assert.strictEqual(result, false);
		});

		it("should rethrow an error that isn't ENOENT", async () => {
			const impl = new NodeHfsImpl({
				fsp: {
					async stat() {
						throw new Error("Boom!");
					},
				},
			});
			await assert.rejects(() => impl.isFile("foo.txt"), /Boom!/);
		});
	});

	describe("isDirectory()", () => {
		it("should return false when a file isn't present", async () => {
			const impl = new NodeHfsImpl({ fsp });
			const result = await impl.isDirectory(".hfs/foo");
			assert.strictEqual(result, false);
		});

		it("should rethrow an error that isn't ENOENT", async () => {
			const impl = new NodeHfsImpl({
				fsp: {
					async stat() {
						throw new Error("Boom!");
					},
				},
			});
			await assert.rejects(() => impl.isDirectory(".hfs/foo"), /Boom!/);
		});
	});

	describe("bytes()", () => {
		it("should return contents when ENFILE error occurs", async () => {
			const contents = new TextEncoder().encode("Hello world!");
			let callCount = 0;
			const impl = new NodeHfsImpl({
				fsp: {
					async readFile() {
						if (callCount === 0) {
							callCount++;
							const error = new Error(
								"ENFILE: file table overflow",
							);
							error.code = "ENFILE";
							throw error;
						}

						return Buffer.from(contents.buffer);
					},
				},
			});

			const result = await impl.bytes(".hfs/foo");
			assert.deepStrictEqual(result, contents);
		});

		it("should return contents when EMFILE error occurs", async () => {
			const contents = new TextEncoder().encode("Hello world!");
			let callCount = 0;
			const impl = new NodeHfsImpl({
				fsp: {
					async readFile() {
						if (callCount === 0) {
							callCount++;
							const error = new Error(
								"EMFILE: file table overflow",
							);
							error.code = "EMFILE";
							throw error;
						}

						return Buffer.from(contents.buffer);
					},
				},
			});

			const result = await impl.bytes(".hfs/foo");
			assert.deepStrictEqual(result, contents);
		});

		it("should return text contents when EMFILE error occurs multiple times", async () => {
			const contents = new TextEncoder().encode("Hello world!");
			let callCount = 0;
			const impl = new NodeHfsImpl({
				fsp: {
					async readFile() {
						if (callCount < 3) {
							callCount++;
							const error = new Error(
								"EMFILE: file table overflow",
							);
							error.code = "EMFILE";
							throw error;
						}

						return Buffer.from(contents.buffer);
					},
				},
			});

			const result = await impl.bytes(".hfs/foo");
			assert.deepStrictEqual(result, contents);
		});

		it("should rethrow an error that isn't ENFILE", async () => {
			const impl = new NodeHfsImpl({
				fsp: {
					async readFile() {
						throw new Error("Boom!");
					},
				},
			});
			await assert.rejects(() => impl.bytes(".hfs/foo"), /Boom!/);
		});
	});

	describe("write()", () => {
		it("should return contents when ENFILE error occurs", async () => {
			let callCount = 0;
			let success = false;
			const impl = new NodeHfsImpl({
				fsp: {
					async writeFile() {
						if (callCount === 0) {
							callCount++;
							const error = new Error(
								"ENFILE: file table overflow",
							);
							error.code = "ENFILE";
							throw error;
						}

						success = true;
					},
				},
			});

			await impl.write(".hfs/foo", "Hello world!");
			assert.ok(success);
		});

		it("should return contents when EMFILE error occurs", async () => {
			let callCount = 0;
			let success = false;
			const impl = new NodeHfsImpl({
				fsp: {
					async writeFile() {
						if (callCount === 0) {
							callCount++;
							const error = new Error(
								"EMFILE: file table overflow",
							);
							error.code = "EMFILE";
							throw error;
						}

						success = true;
					},
				},
			});

			await impl.write(".hfs/foo", "Hello world!");
			assert.ok(success);
		});

		it("should return text contents when EMFILE error occurs multiple times", async () => {
			let callCount = 0;
			let success = false;
			const impl = new NodeHfsImpl({
				fsp: {
					async writeFile() {
						if (callCount < 3) {
							callCount++;
							const error = new Error(
								"EMFILE: file table overflow",
							);
							error.code = "EMFILE";
							throw error;
						}

						success = true;
					},
				},
			});

			await impl.write(".hfs/foo", "Hello world!");
			assert.ok(success);
		});

		it("should rethrow an error that isn't ENFILE", async () => {
			const impl = new NodeHfsImpl({
				fsp: {
					async writeFile() {
						throw new Error("Boom!");
					},
				},
			});
			await assert.rejects(
				() => impl.write(".hfs/foo", "Hello world!"),
				/Boom!/,
			);
		});
	});
});
