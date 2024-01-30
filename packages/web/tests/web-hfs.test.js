/**
 * @fileoverview Tests for the Hfs class.
 * @author Nicholas C. Zakas
 */

/* global navigator */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import { WebHfsImpl } from "../src/web-hfs.js";
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
});

await tester.test({
	name: "MemoryHfsImpl",
	impl: new WebHfsImpl({ root: await navigator.storage.getDirectory() }),
});
