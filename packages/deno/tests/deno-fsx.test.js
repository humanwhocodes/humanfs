/**
 * @fileoverview Tests for the Fsx class.
 * @author Nicholas C. Zakas
 */

/* global TextEncoder */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import {
	describe,
	it,
	beforeEach,
	afterEach,
} from "https://deno.land/std/testing/bdd.ts";
import { DenoFsxImpl } from "../src/deno-fsx.js";
import { FsxImplTester } from "../../test/src/index.js";
import {
	assert,
	assertEquals,
	assertObjectMatch,
	assertRejects,
} from "https://deno.land/std/assert/mod.ts";
import * as path from "https://deno.land/std/path/mod.ts";

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

const __filename = path.fromFileUrl(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesDir = path.resolve(__dirname, "fixtures");

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const tester = new FsxImplTester({
	outputDir: fixturesDir,
	assert: {
		strictEqual: assertEquals,
		deepStrictEqual: assertObjectMatch,
		rejects: assertRejects,
		ok: assert,
	},
	test: {
		describe,
		it,
		beforeEach,
		afterEach,
	},
});

await tester.test({
	name: "DenoFsxImpl",
	impl: new DenoFsxImpl(),
});

describe("DenoFsxImpl Customizations", () => {
	describe("isFile()", () => {
		it("should return false when a file isn't present", async () => {
			const impl = new DenoFsxImpl();
			const result = await impl.isFile("foo.txt");
			assertEquals(result, false);
		});

		it("should rethrow an error that isn't ENOENT", async () => {
			const impl = new DenoFsxImpl({
				deno: {
					async stat() {
						throw new Error("Boom!");
					},
				},
			});
			await assertRejects(() => impl.isFile("foo.txt"), /Boom!/);
		});
	});

	describe("isDirectory()", () => {
		it("should return false when a file isn't present", async () => {
			const impl = new DenoFsxImpl();
			const result = await impl.isDirectory(".fsx/foo");
			assertEquals(result, false);
		});

		it("should rethrow an error that isn't ENOENT", async () => {
			const impl = new DenoFsxImpl({
				deno: {
					async stat() {
						throw new Error("Boom!");
					},
				},
			});
			await assertRejects(() => impl.isDirectory(".fsx/foo"), /Boom!/);
		});
	});

	describe("text()", () => {
		it("should return text contents when ENFILE error occurs", async () => {
			let callCount = 0;
			const impl = new DenoFsxImpl({
				deno: {
					async readTextFile() {
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
			assertEquals(result, "Hello world!");
		});

		it("should return text contents when EMFILE error occurs", async () => {
			let callCount = 0;
			const impl = new DenoFsxImpl({
				deno: {
					async readTextFile() {
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
			assertEquals(result, "Hello world!");
		});

		it("should return text contents when EMFILE error occurs multiple times", async () => {
			let callCount = 0;
			const impl = new DenoFsxImpl({
				deno: {
					async readTextFile() {
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
			assertEquals(result, "Hello world!");
		});

		it("should rethrow an error that isn't ENFILE", async () => {
			const impl = new DenoFsxImpl({
				deno: {
					async readTextFile() {
						throw new Error("Boom!");
					},
				},
			});
			await assertRejects(() => impl.text(".fsx/foo"), /Boom!/);
		});

		it("should rethrow an error that isn't ENFILE after ENFILE occurs", async () => {
			let callCount = 0;
			const impl = new DenoFsxImpl({
				deno: {
					async readTextFile() {
						if (callCount < 3) {
							callCount++;
							const error = new Error(
								"EMFILE: file table overflow",
							);
							error.code = "EMFILE";
							throw error;
						}

						throw new Error("Boom!");
					},
				},
			});
			await assertRejects(() => impl.text(".fsx/foo"), /Boom!/);
		});
	});

	describe("arrayBuffer()", () => {
		it("should return contents when ENFILE error occurs", async () => {
			const contents = new TextEncoder().encode("Hello world!").buffer;
			let callCount = 0;
			const impl = new DenoFsxImpl({
				deno: {
					async readFile() {
						if (callCount === 0) {
							callCount++;
							const error = new Error(
								"ENFILE: file table overflow",
							);
							error.code = "ENFILE";
							throw error;
						}

						return new Uint8Array(contents);
					},
				},
			});

			const result = await impl.arrayBuffer(".fsx/foo");
			assertEquals(result, contents);
		});

		it("should return contents when EMFILE error occurs", async () => {
			const contents = new TextEncoder().encode("Hello world!").buffer;
			let callCount = 0;
			const impl = new DenoFsxImpl({
				deno: {
					async readFile() {
						if (callCount === 0) {
							callCount++;
							const error = new Error(
								"EMFILE: file table overflow",
							);
							error.code = "EMFILE";
							throw error;
						}

						return new Uint8Array(contents);
					},
				},
			});

			const result = await impl.arrayBuffer(".fsx/foo");
			assertEquals(result, contents);
		});

		it("should return text contents when EMFILE error occurs multiple times", async () => {
			const contents = new TextEncoder().encode("Hello world!").buffer;
			let callCount = 0;
			const impl = new DenoFsxImpl({
				deno: {
					async readFile() {
						if (callCount < 3) {
							callCount++;
							const error = new Error(
								"EMFILE: file table overflow",
							);
							error.code = "EMFILE";
							throw error;
						}

						return new Uint8Array(contents);
					},
				},
			});

			const result = await impl.arrayBuffer(".fsx/foo");
			assertEquals(result, contents);
		});

		it("should rethrow an error that isn't ENFILE", async () => {
			const impl = new DenoFsxImpl({
				deno: {
					async readFile() {
						throw new Error("Boom!");
					},
				},
			});
			await assertRejects(() => impl.arrayBuffer(".fsx/foo"), /Boom!/);
		});
	});

	describe("write()", () => {
		it("should return contents when ENFILE error occurs", async () => {
			let callCount = 0;
			let success = false;
			const impl = new DenoFsxImpl({
				deno: {
					async writeTextFile() {
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
			assert(success);
		});

		it("should return contents when EMFILE error occurs", async () => {
			let callCount = 0;
			let success = false;
			const impl = new DenoFsxImpl({
				deno: {
					async writeTextFile() {
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
			assert(success);
		});

		it("should return text contents when EMFILE error occurs multiple times", async () => {
			let callCount = 0;
			let success = false;
			const impl = new DenoFsxImpl({
				deno: {
					async writeTextFile() {
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
			assert(success);
		});

		it("should rethrow an error that isn't ENFILE", async () => {
			const impl = new DenoFsxImpl({
				deno: {
					async writeTextFile() {
						throw new Error("Boom!");
					},
				},
			});
			await assertRejects(
				() => impl.write(".fsx/foo", "Hello world!"),
				/Boom!/,
			);
		});
	});
});
