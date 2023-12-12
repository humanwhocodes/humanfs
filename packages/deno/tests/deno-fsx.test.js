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
