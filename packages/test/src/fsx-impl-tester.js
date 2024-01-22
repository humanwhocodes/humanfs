/**
 * @fileoverview Tester for FsxImpl classes. This is used to ensure that all
 *  FsxImpl classes have the same API and behavior.
 */

/* global TextEncoder, TextDecoder */

//------------------------------------------------------------------------------
// Types
//------------------------------------------------------------------------------

/** @typedef {import("fsx-types").FsxImpl} FsxImpl*/

/**
 * @typedef {Object} Assert
 * @property {Function} strictEqual Asserts that two values are strictly equal.
 * @property {Function} rejects Asserts that a promise rejects.
 * @property {Function} deepStrictEqual Asserts that two values are deeply equal.
 * @property {Function} ok Asserts that a value is truthy.
 * @property {Function} fail Asserts that a value is falsy.
 */

/**
 * @typedef {Object} BddTest
 * @property {Function} it A test function.
 * @property {Function} describe A test suite function.
 * @property {Function} beforeEach A function to run before each test.
 * @property {Function} afterEach A function to run after each test.
 */

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

export class FsxImplTester {
	/**
	 * The assert object to use.
	 * @type {Assert}
	 */
	#assert;

	/**
	 * The test library to use.
	 * @type {BddTest}
	 */
	#test;

	/**
	 * The directory where output files should be written.
	 * @type {string}
	 */
	#outputDir;

	/**
	 * Creates a new instance.
	 * @param {object} options Options for the tester.
	 * @param {Assert} options.assert The assert function to use.
	 * @param {BddTest} options.test The test library to use.
	 * @param {string} options.outputDir The directory where output files should be written.
	 */
	constructor({ assert, test, outputDir }) {
		if (!outputDir) {
			throw new Error("outputDir is required");
		}

		this.#assert = assert;
		this.#test = test;
		this.#outputDir = outputDir;
	}

	/**
	 * Runs the tests.
	 * @param {object} options Options for the test.
	 * @param {string} options.name The name of the test.
	 * @param {FsxImpl} options.impl The FsxImpl instance to test.
	 * @returns {Promise<void>}
	 */
	async test({ name, impl }) {
		const { it, describe, beforeEach, afterEach } = this.#test;
		const assert = this.#assert;

		describe(name, () => {
			// set up the fixtures directory
			beforeEach(async () => {
				await impl.createDirectory(this.#outputDir);
				await impl.write(
					this.#outputDir + "/hello.txt",
					"Hello world!\n",
				);
				await impl.write(
					this.#outputDir + "/message.json",
					JSON.stringify({ message: "Hello world!" }),
				);
			});

			// clean up the fixtures directory
			afterEach(async () => {
				await impl.delete(this.#outputDir);
			});

			describe("text()", () => {
				it("should read a file and return the contents as a string", async () => {
					const filePath = this.#outputDir + "/hello.txt";
					const result = await impl.text(filePath);
					assert.strictEqual(result, "Hello world!\n");
				});

				it("should return undefined when a file doesn't exist", async () => {
					const result = await impl.text(
						this.#outputDir + "/nonexistent.txt",
					);
					assert.strictEqual(
						result,
						undefined,
						"Expected undefined when reading a nonexistent file",
					);
				});
			});

			describe("json()", () => {
				it("should read a file and return the contents as a JSON object", async () => {
					const filePath = this.#outputDir + "/message.json";
					const result = await impl.json(filePath);
					assert.deepStrictEqual(result, { message: "Hello world!" });
				});

				it("should return undefined when a file doesn't exist", async () => {
					const result = await impl.json(
						this.#outputDir + "/nonexistent.txt",
					);
					assert.strictEqual(
						result,
						undefined,
						"Expected undefined when reading a nonexistent file",
					);
				});
			});

			describe("arrayBuffer()", () => {
				it("should read a file and return the contents as an ArrayBuffer", async () => {
					const filePath = this.#outputDir + "/hello.txt";
					const result = await impl.arrayBuffer(filePath);
					assert.ok(result instanceof ArrayBuffer);
					const decoder = new TextDecoder();
					assert.strictEqual(
						decoder.decode(result),
						"Hello world!\n",
					);
				});

				it("should return undefined when a file doesn't exist", async () => {
					const result = await impl.arrayBuffer(
						this.#outputDir + "/nonexistent.txt",
					);
					assert.strictEqual(
						result,
						undefined,
						"Expected undefined when reading a nonexistent file",
					);
				});
			});

			describe("bytes()", () => {
				it("should read a file and return the contents as an Uint8Array", async () => {
					const filePath = this.#outputDir + "/hello.txt";
					const result = await impl.bytes(filePath);
					assert.ok(result instanceof Uint8Array);
					const decoder = new TextDecoder();
					assert.strictEqual(
						decoder.decode(result),
						"Hello world!\n",
					);
				});

				it("should return undefined when a file doesn't exist", async () => {
					const result = await impl.bytes(
						this.#outputDir + "/nonexistent.txt",
					);
					assert.strictEqual(
						result,
						undefined,
						"Expected undefined when reading a nonexistent file",
					);
				});
			});

			describe("write()", () => {
				beforeEach(async () => {
					await impl.createDirectory(this.#outputDir + "/tmp-write");
				});

				afterEach(async () => {
					await impl.delete(this.#outputDir + "/tmp-write");
				});

				it("should write a string to a file", async () => {
					const filePath =
						this.#outputDir + "/tmp-write/test-generated-text.txt";
					await impl.write(filePath, "Hello, world!");

					// make sure the file was written
					const result = await impl.text(filePath);
					assert.strictEqual(result, "Hello, world!");
				});

				it("should write an ArrayBuffer to a file", async () => {
					const filePath =
						this.#outputDir +
						"/tmp-write/test-generated-arraybuffer.txt";
					await impl.write(
						filePath,
						new TextEncoder().encode("Hello, world!").buffer,
					);

					// make sure the file was written
					const result = await impl.text(filePath);
					assert.strictEqual(result, "Hello, world!");
				});

				it("should write a Uint8Array to a file", async () => {
					const filePath =
						this.#outputDir +
						"/tmp-write/test-generated-arraybuffer.txt";
					await impl.write(
						filePath,
						new TextEncoder().encode("Hello, world!"),
					);

					// make sure the file was written
					const result = await impl.text(filePath);
					assert.strictEqual(result, "Hello, world!");
				});

				it("should write to an already existing file", async () => {
					const filePath =
						this.#outputDir + "/tmp-write/test-generated-text.txt";
					await impl.write(filePath, "Hello, world!");

					await impl.write(filePath, "Goodbye, world!");

					// make sure the file was written
					const result = await impl.text(filePath);
					assert.strictEqual(result, "Goodbye, world!");
				});

				it("should write a file when the directory doesn't exist", async () => {
					const filePath =
						this.#outputDir +
						"/tmp-write/nonexistent/test-generated-text.txt";

					await impl.write(filePath, "Hello, world!");

					// make sure the file was written
					const result = await impl.text(filePath);
					assert.strictEqual(result, "Hello, world!");
				});
			});

			describe("isFile()", () => {
				it("should return true if a file exists", async () => {
					const filePath = this.#outputDir + "/hello.txt";
					const result = await impl.isFile(filePath);
					assert.strictEqual(result, true);
				});

				it("should return false if a file doesn't exist", async () => {
					const filePath = this.#outputDir + "/nonexistent.txt";
					const result = await impl.isFile(filePath);
					assert.strictEqual(result, false);
				});

				it("should return false if a directory exists", async () => {
					const result = await impl.isFile(this.#outputDir);
					assert.strictEqual(result, false);
				});
			});

			describe("isDirectory()", () => {
				it("should return true if a directory exists", async () => {
					const result = await impl.isDirectory(this.#outputDir);
					assert.strictEqual(result, true);
				});

				it("should return false if a directory doesn't exist", async () => {
					const dirPath = this.#outputDir + "/nonexistent";
					const result = await impl.isDirectory(dirPath);
					assert.strictEqual(result, false);
				});

				it("should return false if a file exists", async () => {
					const filePath = this.#outputDir + "/hello.txt";
					const result = await impl.isDirectory(filePath);
					assert.strictEqual(result, false);
				});
			});

			describe("createDirectory()", () => {
				afterEach(async () => {
					await impl.delete(this.#outputDir + "/tmp-create");
				});

				it("should create a directory", async () => {
					const dirPath = this.#outputDir + "/tmp-create";
					await impl.createDirectory(dirPath);

					const result = await impl.isDirectory(dirPath);
					assert.ok(result, "Expected directory to exist");
				});

				it("should create a directory recursively", async () => {
					const dirPath = this.#outputDir + "/tmp-create/subdir";
					await impl.createDirectory(dirPath);

					const result = await impl.isDirectory(dirPath);
					assert.ok(result, "Expected directory to exist");
				});

				it("should not reject a promise when the directory already exists", async () => {
					const dirPath = this.#outputDir + "/tmp-create";
					await impl.createDirectory(dirPath);

					return impl.createDirectory(dirPath);
				});
			});

			describe("delete()", () => {
				let dirPath = this.#outputDir + "/tmp-delete";

				beforeEach(async () => {
					await impl.createDirectory(dirPath);
					await impl.createDirectory(dirPath + "/subdir");
					await impl.createDirectory(dirPath + "/subdir/subsubdir");
					await impl.write(
						dirPath + "/subdir/subsubdir/test.txt",
						"Hello, world!",
					);
				});

				afterEach(async () => {
					await impl.delete(dirPath);
				});

				it("should delete a file", async () => {
					const filePath = dirPath + "/subdir/subsubdir/test.txt";
					await impl.delete(filePath);

					assert.strictEqual(await impl.isFile(filePath), false);
				});

				it("should delete a directory", async () => {
					const subsubdirPath = dirPath + "/subdir/subsubdir";
					await impl.delete(subsubdirPath);

					assert.strictEqual(
						await impl.isDirectory(subsubdirPath),
						false,
					);
				});

				it("should delete a directory recursively", async () => {
					const subdirPath = dirPath + "/subdir";
					await impl.delete(subdirPath);

					assert.strictEqual(
						await impl.isDirectory(subdirPath),
						false,
					);
				});

				it("should reject a promise when the file or directory doesn't exist", async () => {
					const filePath = dirPath + "/nonexistent.txt";
					assert.strictEqual(await impl.isFile(filePath), false);
				});
			});

			describe("list()", () => {
				it("should return an async iterable", async () => {
					const dirPath = this.#outputDir + "/tmp-list";
					await impl.createDirectory(dirPath + "/subdir");
					await impl.write(dirPath + "/test1.txt", "Hello, world!");
					await impl.write(dirPath + "/test2.txt", "Hello, world!");

					const result = await impl.list(dirPath);
					assert.ok(result[Symbol.asyncIterator]);
				});

				it("should list the contents of a directory", async () => {
					const dirPath = this.#outputDir + "/tmp-list";
					await impl.createDirectory(dirPath + "/subdir");
					await impl.write(dirPath + "/test1.txt", "Hello, world!");
					await impl.write(dirPath + "/test2.txt", "Hello, world!");
					const result = [];

					for await (const entry of impl.list(dirPath)) {
						result.push(entry);
					}

					const expected = [
						{
							name: "subdir",
							isDirectory: true,
							isFile: false,
							isSymlink: false,
						},
						{
							name: "test1.txt",
							isDirectory: false,
							isFile: true,
							isSymlink: false,
						},
						{
							name: "test2.txt",
							isDirectory: false,
							isFile: true,
							isSymlink: false,
						},
					];

					for (const entry of expected) {
						const item = result.find(
							item => item.name === entry.name,
						);
						assert.ok(item);

						assert.strictEqual(item.isDirectory, entry.isDirectory);
						assert.strictEqual(item.isFile, entry.isFile);
						assert.strictEqual(item.isSymlink, entry.isSymlink);
					}
				});
			});
		});
	}
}
