/**
 * @fileoverview Tests for the Fsx class.
 * @author Nicholas C. Zakas
 */

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
});
