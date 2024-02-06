/**
 * @fileoverview Tests for the Hfs class.
 * @author Nicholas C. Zakas
 */

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
	name: "MemoryHfsImpl",
	impl: new MemoryHfsImpl({ volume }),
});
