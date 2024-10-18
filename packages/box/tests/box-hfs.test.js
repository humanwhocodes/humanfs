/**
 * @fileoverview Tests for the Hfs class.
 * @author Nicholas C. Zakas
 */

/*global describe, before, after */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import { BoxHfsImpl } from "../src/box-hfs.js";
import { HfsImplTester } from "@humanfs/test";
import { server } from "./util/server.js";
import assert from "node:assert";
import dotenv from "dotenv";

dotenv.config();

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
