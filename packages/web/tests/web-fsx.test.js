/**
 * @fileoverview Tests for the Fsx class.
 * @author Nicholas C. Zakas
 */

/* global navigator */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import { WebFsxImpl } from "../src/web-fsx.js";
import { FsxImplTester } from "fsx-test";
import assert from "node:assert";

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

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
	impl: new WebFsxImpl({ root: await navigator.storage.getDirectory() }),
});
