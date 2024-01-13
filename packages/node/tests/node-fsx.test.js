/**
 * @fileoverview Tests for the Fsx class.
 * @author Nicholas C. Zakas
 */

/*global describe, it, TextEncoder, Buffer */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import { NodeFsxImpl } from "../src/node-fsx.js";
import assert from "node:assert";
import fsp from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { FsxImplTester } from "fsx-test";

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesDir = path.resolve(__dirname, "fixtures/tmp");

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const tester = new FsxImplTester({
	outputDir: fixturesDir,
	assert,
	test: globalThis,
});

await tester.test({
	name: "NodeFsxImpl",
	impl: new NodeFsxImpl({ fsp }),
});

describe("NodeFsxImpl Customizations", () => {
	describe("isFile()", () => {
		it("should return false when a file isn't present", async () => {
			const impl = new NodeFsxImpl({ fsp });
			const result = await impl.isFile("foo.txt");
			assert.strictEqual(result, false);
		});

		it("should rethrow an error that isn't ENOENT", async () => {
			const impl = new NodeFsxImpl({
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
			const impl = new NodeFsxImpl({ fsp });
			const result = await impl.isDirectory(".fsx/foo");
			assert.strictEqual(result, false);
		});

		it("should rethrow an error that isn't ENOENT", async () => {
			const impl = new NodeFsxImpl({
				fsp: {
					async stat() {
						throw new Error("Boom!");
					},
				},
			});
			await assert.rejects(() => impl.isDirectory(".fsx/foo"), /Boom!/);
		});
	});

	describe("text()", () => {
		it("should return text contents when ENFILE error occurs", async () => {
			let callCount = 0;
			const impl = new NodeFsxImpl({
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

						return "Hello world!";
					},
				},
			});

			const result = await impl.text(".fsx/foo");
			assert.strictEqual(result, "Hello world!");
		});

		it("should return text contents when EMFILE error occurs", async () => {
			let callCount = 0;
			const impl = new NodeFsxImpl({
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

						return "Hello world!";
					},
				},
			});

			const result = await impl.text(".fsx/foo");
			assert.strictEqual(result, "Hello world!");
		});

		it("should return text contents when EMFILE error occurs  multiple times", async () => {
			let callCount = 0;
			const impl = new NodeFsxImpl({
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

						return "Hello world!";
					},
				},
			});

			const result = await impl.text(".fsx/foo");
			assert.strictEqual(result, "Hello world!");
		});

		it("should rethrow an error that isn't ENFILE", async () => {
			const impl = new NodeFsxImpl({
				fsp: {
					async readFile() {
						throw new Error("Boom!");
					},
				},
			});
			await assert.rejects(() => impl.text(".fsx/foo"), /Boom!/);
		});
	});

	describe("arrayBuffer()", () => {
		it("should return contents when ENFILE error occurs", async () => {
			const contents = new TextEncoder().encode("Hello world!").buffer;
			let callCount = 0;
			const impl = new NodeFsxImpl({
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

						return Buffer.from(contents);
					},
				},
			});

			const result = await impl.arrayBuffer(".fsx/foo");
			assert.strictEqual(result, contents);
		});

		it("should return contents when EMFILE error occurs", async () => {
			const contents = new TextEncoder().encode("Hello world!").buffer;
			let callCount = 0;
			const impl = new NodeFsxImpl({
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

						return Buffer.from(contents);
					},
				},
			});

			const result = await impl.arrayBuffer(".fsx/foo");
			assert.strictEqual(result, contents);
		});

		it("should return text contents when EMFILE error occurs multiple times", async () => {
			const contents = new TextEncoder().encode("Hello world!").buffer;
			let callCount = 0;
			const impl = new NodeFsxImpl({
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

						return Buffer.from(contents);
					},
				},
			});

			const result = await impl.arrayBuffer(".fsx/foo");
			assert.strictEqual(result, contents);
		});

		it("should rethrow an error that isn't ENFILE", async () => {
			const impl = new NodeFsxImpl({
				fsp: {
					async readFile() {
						throw new Error("Boom!");
					},
				},
			});
			await assert.rejects(() => impl.arrayBuffer(".fsx/foo"), /Boom!/);
		});
	});

	describe("write()", () => {
		it("should return contents when ENFILE error occurs", async () => {
			let callCount = 0;
			let success = false;
			const impl = new NodeFsxImpl({
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

			await impl.write(".fsx/foo", "Hello world!");
			assert.ok(success);
		});

		it("should return contents when EMFILE error occurs", async () => {
			let callCount = 0;
			let success = false;
			const impl = new NodeFsxImpl({
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

			await impl.write(".fsx/foo", "Hello world!");
			assert.ok(success);
		});

		it("should return text contents when EMFILE error occurs multiple times", async () => {
			let callCount = 0;
			let success = false;
			const impl = new NodeFsxImpl({
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

			await impl.write(".fsx/foo", "Hello world!");
			assert.ok(success);
		});

		it("should rethrow an error that isn't ENFILE", async () => {
			const impl = new NodeFsxImpl({
				fsp: {
					async writeFile() {
						throw new Error("Boom!");
					},
				},
			});
			await assert.rejects(
				() => impl.write(".fsx/foo", "Hello world!"),
				/Boom!/,
			);
		});
	});
});
