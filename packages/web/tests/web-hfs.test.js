/**
 * @fileoverview Tests for the Hfs class.
 * @author Nicholas C. Zakas
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import { WebHfsImpl } from "../src/web-hfs.js";
import { HfsImplTester } from "@humanfs/test";
import { assert } from "vitest";

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

const fixturesDir = "fixtures";
const root = await navigator.storage.getDirectory();

/**
 * Adapts Chai's `assert` to the subset of the `node:assert` API that
 * `HfsImplTester` uses. Node built-ins aren't available in the browser, so the
 * tester gets this shim instead.
 * @type {object}
 */
const nodeAssert = {
	ok: assert.ok,
	strictEqual: assert.strictEqual,
	deepStrictEqual: assert.deepEqual,

	/**
	 * Asserts that an async function rejects with an error matching `expected`.
	 * @param {() => Promise<any>} fn The function to call.
	 * @param {RegExp} expected Pattern the error message must match.
	 * @returns {Promise<void>}
	 */
	async rejects(fn, expected) {
		try {
			await fn();
		} catch (error) {
			assert.match(error.message, expected);
			return;
		}

		assert.fail("Missing expected rejection.");
	},
};

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const tester = new HfsImplTester({
	outputDir: fixturesDir,
	assert: nodeAssert,
	test: globalThis,
	expectedEntries: [fixturesDir],
});

await tester.test({
	name: "WebHfsImpl",
	impl: new WebHfsImpl({ root }),
});
