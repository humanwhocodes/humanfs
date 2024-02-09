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

const volume = {};
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
	name: "MemoryHfsImpl (with volume)",
	impl: new MemoryHfsImpl({ volume }),
});

await tester.test({
	name: "MemoryHfsImpl (without volume)",
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
});
