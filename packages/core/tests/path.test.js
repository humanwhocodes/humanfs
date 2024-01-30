/**
 * @fileoverview Tests for the Path class.
 * @author Nicholas C. Zakas
 */
/* global it, describe */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import { Path } from "../src/path.js";
import assert from "node:assert";

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe("Path", () => {
	describe("constructor()", () => {
		it("should create an empty path when no arguments are passed", () => {
			const path = new Path();
			assert.deepStrictEqual([...path], []);
		});

		it("should create a path with the given steps", () => {
			const path = new Path(["foo", "bar"]);
			assert.deepStrictEqual([...path], ["foo", "bar"]);
		});

		it("should throw an error when steps is not iterable", () => {
			assert.throws(
				() => {
					new Path(123);
				},
				{
					message: "steps must be iterable",
				},
			);
		});

		it("should throw an error when a step is not a string", () => {
			assert.throws(
				() => {
					new Path([123]);
				},
				{
					message: "name must be a string",
				},
			);
		});

		it("should throw an error when a step is empty", () => {
			assert.throws(
				() => {
					new Path([""]);
				},
				{
					message: "name cannot be empty",
				},
			);
		});

		it('should throw an error when a step is "."', () => {
			assert.throws(
				() => {
					new Path(["."]);
				},
				{
					message: 'name cannot be "."',
				},
			);
		});

		it('should throw an error when a step is ".."', () => {
			assert.throws(
				() => {
					new Path([".."]);
				},
				{
					message: 'name cannot be ".."',
				},
			);
		});

		it("should throw an error when a step contains a slash", () => {
			assert.throws(
				() => {
					new Path(["foo/bar"]);
				},
				{
					message:
						'name cannot contain a slash or backslash: "foo/bar"',
				},
			);
		});

		it("should throw an error when a step contains a backslash", () => {
			assert.throws(
				() => {
					new Path(["foo\\bar"]);
				},
				{
					message:
						'name cannot contain a slash or backslash: "foo\\bar"',
				},
			);
		});

		it("should throw an error when a step is undefined", () => {
			assert.throws(
				() => {
					new Path([undefined]);
				},
				{
					message: "name must be a string",
				},
			);
		});
	});

	describe("push()", () => {
		it("should add a step to the end of the path", () => {
			const path = new Path();
			path.push("foo");
			assert.deepStrictEqual([...path], ["foo"]);
		});

		it("should add multiple steps to the end of the path", () => {
			const path = new Path();
			path.push("foo", "bar");
			assert.deepStrictEqual([...path], ["foo", "bar"]);
		});

		it("should throw an error when adding an invalid step", () => {
			const path = new Path();
			assert.throws(
				() => {
					path.push("foo/bar");
				},
				{
					message:
						'name cannot contain a slash or backslash: "foo/bar"',
				},
			);
		});

		it('should throw an error when adding a step of "."', () => {
			const path = new Path();
			assert.throws(
				() => {
					path.push(".");
				},
				{
					message: 'name cannot be "."',
				},
			);
		});

		it('should throw an error when adding a step of ".."', () => {
			const path = new Path();
			assert.throws(
				() => {
					path.push("..");
				},
				{
					message: 'name cannot be ".."',
				},
			);
		});

		it('should throw an error when adding a step of ""', () => {
			const path = new Path();
			assert.throws(
				() => {
					path.push("");
				},
				{
					message: "name cannot be empty",
				},
			);
		});

		it("should throw an error when adding a step of undefined", () => {
			const path = new Path();
			assert.throws(
				() => {
					path.push(undefined);
				},
				{
					message: "name must be a string",
				},
			);
		});
	});

	describe("pop()", () => {
		it("should remove the last step from the path", () => {
			const path = new Path(["foo", "bar"]);
			assert.strictEqual(path.pop(), "bar");
			assert.deepStrictEqual([...path], ["foo"]);
		});
	});

	describe("[Symbol.iterator]()", () => {
		it("should return an iterator for the steps in the path", () => {
			const path = new Path(["foo", "bar"]);
			const iterator = path[Symbol.iterator]();
			assert.deepStrictEqual(iterator.next(), {
				value: "foo",
				done: false,
			});
			assert.deepStrictEqual(iterator.next(), {
				value: "bar",
				done: false,
			});
			assert.deepStrictEqual(iterator.next(), {
				value: undefined,
				done: true,
			});
		});
	});

	describe("size", () => {
		it("should return the number of steps in the path", () => {
			const path = new Path(["foo", "bar"]);
			assert.strictEqual(path.size, 2);
		});

		it("should return the number of steps in an empty path", () => {
			const path = new Path();
			assert.strictEqual(path.size, 0);
		});
	});

	describe("name", () => {
		it("should return the last step in the path", () => {
			const path = new Path(["foo", "bar"]);
			assert.strictEqual(path.name, "bar");
		});

		it("should set the last step in the path", () => {
			const path = new Path(["foo", "bar"]);
			path.name = "baz";
			assert.deepStrictEqual([...path], ["foo", "baz"]);
		});

		it("should throw an error when setting an invalid name", () => {
			const path = new Path(["foo", "bar"]);
			assert.throws(
				() => {
					path.name = "baz/qux";
				},
				{
					message:
						'name cannot contain a slash or backslash: "baz/qux"',
				},
			);
		});

		it('should throw an error when setting a name of "."', () => {
			const path = new Path(["foo", "bar"]);
			assert.throws(
				() => {
					path.name = ".";
				},
				{
					message: 'name cannot be "."',
				},
			);
		});

		it('should throw an error when setting a name of ".."', () => {
			const path = new Path(["foo", "bar"]);
			assert.throws(
				() => {
					path.name = "..";
				},
				{
					message: 'name cannot be ".."',
				},
			);
		});

		it('should throw an error when setting a name of ""', () => {
			const path = new Path(["foo", "bar"]);
			assert.throws(
				() => {
					path.name = "";
				},
				{
					message: "name cannot be empty",
				},
			);
		});

		it("should throw an error when setting a name of undefined", () => {
			const path = new Path(["foo", "bar"]);
			assert.throws(
				() => {
					path.name = undefined;
				},
				{
					message: "name must be a string",
				},
			);
		});
	});

	describe("toString()", () => {
		it("should return an empty string when there are no steps", () => {
			const path = new Path();
			assert.strictEqual(path.toString(), "");
		});

		it("should return a string with the steps joined by slashes", () => {
			const path = new Path(["foo", "bar"]);
			assert.strictEqual(path.toString(), "foo/bar");
		});
	});

	describe("static fromString()", () => {
		it("should create a new Path instance from a string", () => {
			const path = Path.fromString("foo/bar");
			assert.deepStrictEqual([...path], ["foo", "bar"]);
		});

		it("should create a new Path instance from a string with a leading slash", () => {
			const path = Path.fromString("/foo/bar");
			assert.deepStrictEqual([...path], ["foo", "bar"]);
		});

		it("should create a new Path instance from a string with a trailing slash", () => {
			const path = Path.fromString("foo/bar/");
			assert.deepStrictEqual([...path], ["foo", "bar"]);
		});

		it("should create a new Path instance from a string with a leading and trailing slash", () => {
			const path = Path.fromString("/foo/bar/");
			assert.deepStrictEqual([...path], ["foo", "bar"]);
		});

		it("should create a new Path instance from a string with a leading dot-slash", () => {
			const path = Path.fromString("./foo/bar");
			assert.deepStrictEqual([...path], ["foo", "bar"]);
		});

		it("should create a new Path instance from a string with a leading letter-colon-slash", () => {
			const path = Path.fromString("c:/foo/bar");
			assert.deepStrictEqual([...path], ["foo", "bar"]);
		});
	});
});
