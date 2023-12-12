/**
 * @fileoverview Tests for the Fsx class.
 * @author Nicholas C. Zakas
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import { NodeFsxImpl } from "../src/node-fsx.js";
import assert from "node:assert";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { FsxImplTester } from "@fsx/test";

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesDir = path.resolve(__dirname, "fixtures/tmp");

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const tester = new FsxImplTester({
    outputDir: fixturesDir,
    assert,
    test: globalThis
});

await tester.test({
    name: "NodeFsxImpl",
    impl: new NodeFsxImpl({ fs })
});
