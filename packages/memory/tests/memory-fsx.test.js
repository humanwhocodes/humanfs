/**
 * @fileoverview Tests for the Fsx class.
 * @author Nicholas C. Zakas
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import { MemoryFsxImpl } from "../src/memory-fsx.js";
import { FsxImplTester } from "@fsx/test";
import assert from "node:assert";

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

const volume = {};
const fixturesDir = "fixtures";

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const tester = new FsxImplTester({
	outputDir: fixturesDir,
	assert,
	test: globalThis,
});

await tester.test({
	name: "MemoryFsxImpl",
	impl: new MemoryFsxImpl({ volume }),
});
