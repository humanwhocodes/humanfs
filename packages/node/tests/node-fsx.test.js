/**
 * @fileoverview Tests for the Fsx class.
 * @author Nicholas C. Zakas
 */

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
});
