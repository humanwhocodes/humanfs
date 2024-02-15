/**
 * @fileoverview Tests for the Hfs class.
 * @author Nicholas C. Zakas
 */

/*global describe, it */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import { MemoryHfsImpl } from "../src/memory-hfs.js";
import { HfsImplTester } from "@humanfs/test";
import assert from "node:assert";

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

const fixturesDir = "fixtures";

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const tester = new HfsImplTester({
	outputDir: fixturesDir,
	assert,
	test: globalThis,
	expectedEntries: [fixturesDir],
});

await tester.test({
	name: "MemoryHfsImpl",
	impl: new MemoryHfsImpl(),
});

describe("MemoryHfsImpl Customizations", () => {
	describe("delete()", () => {
		// https://github.com/humanwhocodes/humanfs/issues/74
		it("should delete a file that was just written at the root", async () => {
			const impl = new MemoryHfsImpl();
			await impl.write("foo.txt", "bar");
			await impl.delete("foo.txt");
			const result = await impl.isFile("foo.txt");
			assert.strictEqual(result, false);
		});
	});

	describe("text()", () => {
		it("should return undefined when reading toString", async () => {
			const impl = new MemoryHfsImpl();
			const result = await impl.text("toString");
			assert.strictEqual(result, undefined);
		});
	});
});
