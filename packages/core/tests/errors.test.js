/**
 * @fileoverview Tests for the Hfs class.
 * @author Nicholas C. Zakas
 */
/* global it, describe */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import {
	PermissionError,
	DirectoryError,
	NotFoundError,
} from "../src/errors.js";
import assert from "node:assert";

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe("Errors", () => {
	describe("NotFoundError", () => {
		it("should create an instance with the correct message", () => {
			const error = new NotFoundError("foo.txt");
			assert.strictEqual(
				error.message,
				"ENOENT: No such file or directory, foo.txt",
			);
			assert.strictEqual(error.code, "ENOENT");
		});
	});

	describe("PermissionError", () => {
		it("should create an instance with the correct message", () => {
			const error = new PermissionError("foo.txt");
			assert.strictEqual(
				error.message,
				"EPERM: Operation not permitted, foo.txt",
			);
			assert.strictEqual(error.code, "EPERM");
		});
	});

	describe("DirectoryError", () => {
		it("should create an instance with the correct message", () => {
			const error = new DirectoryError("foo.txt");
			assert.strictEqual(
				error.message,
				"EISDIR: Illegal operation on a directory, foo.txt",
			);
			assert.strictEqual(error.code, "EISDIR");
		});
	});
});
