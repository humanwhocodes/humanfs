/**
 * @fileoverview Tests for the Hfs class.
 * @author Nicholas C. Zakas
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import { BoxHfsImpl } from "../src/box-hfs.js";
import { HfsImplTester } from "@humanfs/test";
import { server } from "./util/server.js";
import assert from "node:assert";

// optional: lets a real Box token be supplied when exercising the live API
try {
	process.loadEnvFile();
} catch {
	// no .env file, which is fine because the tests mock the Box API
}

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

describe("BoxHfs", async () => {
	before(() => {
		server.listen();
	});

	after(() => {
		server.close();
	});

	await tester.test({
		name: "BoxHfsImpl",
		impl: new BoxHfsImpl({ token: "abc123", rootFolderId: "0" }),
	});
});
