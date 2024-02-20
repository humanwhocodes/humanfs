/**
 * @fileoverview Tester for HfsImpl classes. This is used to ensure that all
 *  HfsImpl classes have the same API and behavior.
 */

/* global TextEncoder, TextDecoder, URL */

//------------------------------------------------------------------------------
// Types
//------------------------------------------------------------------------------

/** @typedef {import("@humanfs/types").HfsImpl} HfsImpl*/

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

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const encoder = new TextEncoder();
const HELLO_WORLD = "Hello, world!";
const GOODBYE_WORLD = "Goodbye, world!";
const HELLO_WORLD_BYTES = encoder.encode(HELLO_WORLD);
const GOODBYE_WORLD_BYTES = encoder.encode(GOODBYE_WORLD);
const HELLO_WORLD_JSON = encoder.encode(
	JSON.stringify({ message: HELLO_WORLD }),
);

/**
 * Converts a file path into a URL with a file protocol. This first normalizes
 * the file path to use forward slashes and then creates a URL with the file
 * protocol.
 * @param {string} filePath The file path to convert.
 * @returns {URL} The URL representing the file path.
 */
function filePathToUrl(filePath) {
	const normalizedPath = filePath.replace(/\\/g, "/");
	return new URL("file:///" + normalizedPath);
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

export class HfsImplTester {
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
	 * The expected entries in the output directory.
	 * @type {string[]|undefined}
	 */
	#expectedEntries;

	/**
	 * Creates a new instance.
	 * @param {object} options Options for the tester.
	 * @param {Assert} options.assert The assert function to use.
	 * @param {BddTest} options.test The test library to use.
	 * @param {string} options.outputDir The directory where output files should be written.
	 * @param {string[]} [options.expectedEntries] The expected entries in the output directory.
	 */
	constructor({ assert, test, outputDir, expectedEntries }) {
		if (!outputDir) {
			throw new Error("outputDir is required");
		}

		this.#assert = assert;
		this.#test = test;
		this.#outputDir = outputDir;
		this.#expectedEntries = expectedEntries;
	}

	/**
	 * Runs the tests.
	 * @param {object} options Options for the test.
	 * @param {string} options.name The name of the test.
	 * @param {HfsImpl} options.impl The HfsImpl instance to test.
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
					HELLO_WORLD_BYTES,
				);
				await impl.write(
					this.#outputDir + "/message.json",
					HELLO_WORLD_JSON,
				);
			});

			// clean up the fixtures directory
			afterEach(async () => {
				await impl.deleteAll(this.#outputDir);
			});

			if (impl.bytes) {
				describe("bytes()", () => {
					it("should read a file and return the contents as an Uint8Array", async () => {
						const filePath = this.#outputDir + "/hello.txt";
						const result = await impl.bytes(filePath);
						assert.ok(result instanceof Uint8Array);
						const decoder = new TextDecoder();
						assert.strictEqual(decoder.decode(result), HELLO_WORLD);
					});

					it("should read a file and return the contents as an Uint8Array when using a file URL", async () => {
						const filePath = this.#outputDir + "/hello.txt";
						const fileUrl = filePathToUrl(filePath);
						const result = await impl.bytes(fileUrl);
						assert.ok(result instanceof Uint8Array);
						const decoder = new TextDecoder();
						assert.strictEqual(decoder.decode(result), HELLO_WORLD);
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

					it("should return undefined when a file with the given file URL doesn't exist", async () => {
						const result = await impl.bytes(
							filePathToUrl(this.#outputDir + "/nonexistent.txt"),
						);
						assert.strictEqual(
							result,
							undefined,
							"Expected undefined when reading a nonexistent file",
						);
					});
				});
			}

			describe("write()", () => {
				beforeEach(async () => {
					await impl.createDirectory(this.#outputDir + "/tmp-write");
				});

				afterEach(async () => {
					await impl.deleteAll(this.#outputDir + "/tmp-write");
				});

				it("should write a Uint8Array to a file", async () => {
					const filePath =
						this.#outputDir +
						"/tmp-write/test-generated-arraybuffer.txt";
					await impl.write(filePath, HELLO_WORLD_BYTES);

					// make sure the file was written
					const resultBytes = await impl.bytes(filePath);
					const result = new TextDecoder().decode(resultBytes);
					assert.strictEqual(result, HELLO_WORLD);
				});

				it("should write a Uint8Array to a file URL", async () => {
					const filePath =
						this.#outputDir +
						"/tmp-write/test-generated-arraybuffer.txt";
					const fileUrl = filePathToUrl(filePath);
					await impl.write(fileUrl, HELLO_WORLD_BYTES);

					// make sure the file was written
					const resultBytes = await impl.bytes(filePath);
					const result = new TextDecoder().decode(resultBytes);
					assert.strictEqual(result, HELLO_WORLD);
				});

				it("should write a Uint8Array subarray to a file", async () => {
					const filePath =
						this.#outputDir +
						"/tmp-write/test-generated-arraybuffer.txt";
					const bytes = HELLO_WORLD_BYTES.subarray(4, 7);
					await impl.write(filePath, bytes);

					// make sure the file was written
					const resultBytes = await impl.bytes(filePath);
					const result = new TextDecoder().decode(resultBytes);
					assert.strictEqual(result, "o, ");
				});

				it("should write a Uint8Array subarray to a file URL", async () => {
					const filePath =
						this.#outputDir +
						"/tmp-write/test-generated-arraybuffer.txt";
					const fileUrl = filePathToUrl(filePath);
					const bytes = HELLO_WORLD_BYTES.subarray(4, 7);
					await impl.write(fileUrl, bytes);

					// make sure the file was written
					const resultBytes = await impl.bytes(filePath);
					const result = new TextDecoder().decode(resultBytes);
					assert.strictEqual(result, "o, ");
				});

				it("should write to an already existing file", async () => {
					const filePath =
						this.#outputDir + "/tmp-write/test-generated-text.txt";

					await impl.write(filePath, HELLO_WORLD_BYTES);
					await impl.write(filePath, GOODBYE_WORLD_BYTES);

					// make sure the file was written
					const resultBytes = await impl.bytes(filePath);
					const result = new TextDecoder().decode(resultBytes);
					assert.strictEqual(result, GOODBYE_WORLD);
				});

				it("should write to an already existing file URL", async () => {
					const filePath =
						this.#outputDir + "/tmp-write/test-generated-text.txt";
					const fileUrl = filePathToUrl(filePath);

					await impl.write(fileUrl, HELLO_WORLD_BYTES);
					await impl.write(fileUrl, GOODBYE_WORLD_BYTES);

					// make sure the file was written
					const resultBytes = await impl.bytes(fileUrl);
					const result = new TextDecoder().decode(resultBytes);
					assert.strictEqual(result, "Goodbye, world!");
				});

				it("should write a file when the directory doesn't exist", async () => {
					const filePath =
						this.#outputDir +
						"/tmp-write/nonexistent/test-generated-text.txt";

					await impl.write(filePath, HELLO_WORLD_BYTES);

					// make sure the file was written
					const resultBytes = await impl.bytes(filePath);
					const result = new TextDecoder().decode(resultBytes);
					assert.strictEqual(result, HELLO_WORLD);
				});

				it("should write a file URL when the directory doesn't exist", async () => {
					const filePath =
						this.#outputDir +
						"/tmp-write/nonexistent/test-generated-text.txt";
					const fileUrl = filePathToUrl(filePath);

					await impl.write(fileUrl, HELLO_WORLD_BYTES);

					// make sure the file was written
					const resultBytes = await impl.bytes(fileUrl);
					const result = new TextDecoder().decode(resultBytes);
					assert.strictEqual(result, HELLO_WORLD);
				});
			});

			if (impl.append) {
				describe("append()", () => {
					const dirPath = this.#outputDir + "/tmp-append";

					beforeEach(async () => {
						await impl.createDirectory(dirPath);
					});

					afterEach(async () => {
						await impl.deleteAll(dirPath);
					});

					it("should append a Uint8Array to a file", async () => {
						const filePath =
							dirPath + "/test-generated-arraybuffer.txt";
						await impl.write(filePath, HELLO_WORLD_BYTES);
						await impl.append(filePath, GOODBYE_WORLD_BYTES);

						// make sure the file was written
						const resultBytes = await impl.bytes(filePath);
						const result = new TextDecoder().decode(resultBytes);
						assert.strictEqual(result, HELLO_WORLD + GOODBYE_WORLD);
					});

					it("should append a Uint8Array to a file URL", async () => {
						const filePath =
							dirPath + "/test-generated-arraybuffer.txt";
						const fileUrl = filePathToUrl(filePath);
						await impl.write(fileUrl, HELLO_WORLD_BYTES);
						await impl.append(fileUrl, GOODBYE_WORLD_BYTES);

						// make sure the file was written
						const resultBytes = await impl.bytes(filePath);
						const result = new TextDecoder().decode(resultBytes);
						assert.strictEqual(result, HELLO_WORLD + GOODBYE_WORLD);
					});

					it("should append a Uint8Array subarray to a file", async () => {
						const filePath =
							dirPath + "/test-generated-arraybuffer.txt";
						const bytes = new TextEncoder()
							.encode(HELLO_WORLD + " " + GOODBYE_WORLD)
							.subarray(4, 7);
						await impl.append(filePath, bytes);

						// make sure the file was written
						const resultBytes = await impl.bytes(filePath);
						const result = new TextDecoder().decode(resultBytes);
						assert.strictEqual(result, "o, ");
					});

					it("should append a Uint8Array subarray to a file URL", async () => {
						const filePath =
							dirPath + "/test-generated-arraybuffer.txt";
						const fileUrl = filePathToUrl(filePath);
						const bytes = new TextEncoder()
							.encode(HELLO_WORLD + " " + GOODBYE_WORLD)
							.subarray(4, 7);
						await impl.append(fileUrl, bytes);

						// make sure the file was written
						const resultBytes = await impl.bytes(filePath);
						const result = new TextDecoder().decode(resultBytes);
						assert.strictEqual(result, "o, ");
					});

					it("should append to an already existing file", async () => {
						const filePath = dirPath + "/test-generated-text.txt";

						await impl.append(filePath, HELLO_WORLD_BYTES);
						await impl.append(filePath, GOODBYE_WORLD_BYTES);

						// make sure the file was written
						const resultBytes = await impl.bytes(filePath);
						const result = new TextDecoder().decode(resultBytes);
						assert.strictEqual(result, HELLO_WORLD + GOODBYE_WORLD);
					});

					it("should append to an already existing file URL", async () => {
						const filePath = dirPath + "/test-generated-text.txt";
						const fileUrl = filePathToUrl(filePath);
						await impl.append(fileUrl, HELLO_WORLD_BYTES);
						await impl.append(fileUrl, GOODBYE_WORLD_BYTES);

						// make sure the file was written
						const resultBytes = await impl.bytes(fileUrl);
						const result = new TextDecoder().decode(resultBytes);
						assert.strictEqual(result, HELLO_WORLD + GOODBYE_WORLD);
					});

					it("should append to a file when the directory doesn't exist", async () => {
						const filePath =
							this.#outputDir +
							"/tmp-append/nonexistent/test-generated-text.txt";

						await impl.append(filePath, HELLO_WORLD_BYTES);

						// make sure the file was written
						const resultBytes = await impl.bytes(filePath);
						const result = new TextDecoder().decode(resultBytes);
						assert.strictEqual(result, HELLO_WORLD);
					});

					it("should append to a file URL when the directory doesn't exist", async () => {
						const filePath =
							this.#outputDir +
							"/tmp-append/nonexistent/test-generated-text.txt";
						const fileUrl = filePathToUrl(filePath);

						await impl.append(fileUrl, HELLO_WORLD_BYTES);

						// make sure the file was written
						const resultBytes = await impl.bytes(fileUrl);
						const result = new TextDecoder().decode(resultBytes);
						assert.strictEqual(result, HELLO_WORLD);
					});

					it("should create a file when the file doesn't exist", async () => {
						const filePath = dirPath + "/test-generated-text.txt";

						await impl.append(filePath, HELLO_WORLD_BYTES);

						// make sure the file was written
						const resultBytes = await impl.bytes(filePath);
						const result = new TextDecoder().decode(resultBytes);
						assert.strictEqual(result, HELLO_WORLD);
					});

					it("should create a file when the file URL doesn't exist", async () => {
						const filePath = dirPath + "/test-generated-text.txt";
						const fileUrl = filePathToUrl(filePath);

						await impl.append(fileUrl, HELLO_WORLD_BYTES);

						// make sure the file was written
						const resultBytes = await impl.bytes(fileUrl);
						const result = new TextDecoder().decode(resultBytes);
						assert.strictEqual(result, HELLO_WORLD);
					});
				});
			}

			describe("isFile()", () => {
				it("should return true if a file exists", async () => {
					const filePath = this.#outputDir + "/hello.txt";
					const result = await impl.isFile(filePath);
					assert.strictEqual(result, true);
				});

				it("should return true if a file URL exists", async () => {
					const filePath = this.#outputDir + "/hello.txt";
					const fileUrl = filePathToUrl(filePath);
					const result = await impl.isFile(fileUrl);
					assert.strictEqual(result, true);
				});

				it("should return false if a file doesn't exist", async () => {
					const filePath = this.#outputDir + "/nonexistent.txt";
					const result = await impl.isFile(filePath);
					assert.strictEqual(result, false);
				});

				it("should return false if a file URL doesn't exist", async () => {
					const filePath = this.#outputDir + "/nonexistent.txt";
					const fileUrl = filePathToUrl(filePath);
					const result = await impl.isFile(fileUrl);
					assert.strictEqual(result, false);
				});

				it("should return false if a directory exists", async () => {
					const result = await impl.isFile(this.#outputDir);
					assert.strictEqual(result, false);
				});

				it("should return false if a directory exists at the file URL", async () => {
					const dirUrl = filePathToUrl(this.#outputDir);
					const result = await impl.isFile(dirUrl);
					assert.strictEqual(result, false);
				});
			});

			describe("isDirectory()", () => {
				it("should return true if a directory exists", async () => {
					const result = await impl.isDirectory(this.#outputDir);
					assert.strictEqual(result, true);
				});

				it("should return true if a directory exists at the file URL", async () => {
					const dirUrl = filePathToUrl(this.#outputDir);
					const result = await impl.isDirectory(dirUrl);
					assert.strictEqual(result, true);
				});

				it("should return false if a directory doesn't exist", async () => {
					const dirPath = this.#outputDir + "/nonexistent";
					const result = await impl.isDirectory(dirPath);
					assert.strictEqual(result, false);
				});

				it("should return false if a directory doesn't exist at the file URL", async () => {
					const dirUrl = filePathToUrl(
						this.#outputDir + "/nonexistent",
					);
					const result = await impl.isDirectory(dirUrl);
					assert.strictEqual(result, false);
				});

				it("should return false if a file exists", async () => {
					const filePath = this.#outputDir + "/hello.txt";
					const result = await impl.isDirectory(filePath);
					assert.strictEqual(result, false);
				});

				it("should return false if a file exists at the file URL", async () => {
					const filePath = this.#outputDir + "/hello.txt";
					const fileUrl = filePathToUrl(filePath);
					const result = await impl.isDirectory(fileUrl);
					assert.strictEqual(result, false);
				});
			});

			describe("createDirectory()", () => {
				afterEach(async () => {
					await impl.deleteAll(this.#outputDir + "/tmp-create");
				});

				it("should create a directory", async () => {
					const dirPath = this.#outputDir + "/tmp-create";
					await impl.createDirectory(dirPath);

					const result = await impl.isDirectory(dirPath);
					assert.ok(result, "Expected directory to exist");
				});

				it("should create a directory at the file URL", async () => {
					const dirPath = this.#outputDir + "/tmp-create";
					const dirUrl = filePathToUrl(dirPath);
					await impl.createDirectory(dirUrl);

					const result = await impl.isDirectory(dirPath);
					assert.ok(result, "Expected directory to exist");
				});

				it("should create a directory recursively", async () => {
					const dirPath = this.#outputDir + "/tmp-create/subdir";
					await impl.createDirectory(dirPath);

					const result = await impl.isDirectory(dirPath);
					assert.ok(result, "Expected directory to exist");
				});

				it("should create a directory recursively at the file URL", async () => {
					const dirPath = this.#outputDir + "/tmp-create/subdir";
					const dirUrl = filePathToUrl(dirPath);
					await impl.createDirectory(dirUrl);

					const result = await impl.isDirectory(dirPath);
					assert.ok(result, "Expected directory to exist");
				});

				it("should not reject a promise when the directory already exists", async () => {
					const dirPath = this.#outputDir + "/tmp-create";
					await impl.createDirectory(dirPath);

					return impl.createDirectory(dirPath);
				});

				it("should not reject a promise when the directory already exists at the file URL", async () => {
					const dirPath = this.#outputDir + "/tmp-create";
					const dirUrl = filePathToUrl(dirPath);
					await impl.createDirectory(dirUrl);

					return impl.createDirectory(dirUrl);
				});
			});

			if (impl.delete) {
				describe("delete()", () => {
					let dirPath = this.#outputDir + "/tmp-delete";

					beforeEach(async () => {
						await impl.createDirectory(dirPath);
						await impl.createDirectory(dirPath + "/subdir");
						await impl.createDirectory(dirPath + "/empty-subdir");
						await impl.createDirectory(
							dirPath + "/subdir/subsubdir",
						);
						await impl.write(
							dirPath + "/subdir/subsubdir/test.txt",
							HELLO_WORLD_BYTES,
						);
					});

					afterEach(async () => {
						await impl.deleteAll(dirPath);
					});

					it("should delete a file", async () => {
						const filePath = dirPath + "/subdir/subsubdir/test.txt";
						const result = await impl.delete(filePath);

						assert.strictEqual(await impl.isFile(filePath), false);
						assert.strictEqual(result, true);
					});

					it("should delete a file at the file URL", async () => {
						const filePath = dirPath + "/subdir/subsubdir/test.txt";
						const fileUrl = filePathToUrl(filePath);
						const result = await impl.delete(fileUrl);

						assert.strictEqual(await impl.isFile(filePath), false);
						assert.strictEqual(result, true);
					});

					it("should delete an empty directory", async () => {
						const emptySubdirPath = dirPath + "/empty-subdir";
						const result = await impl.delete(emptySubdirPath);

						assert.strictEqual(
							await impl.isDirectory(emptySubdirPath),
							false,
						);
						assert.strictEqual(result, true);
					});

					it("should delete an empty directory at the file URL", async () => {
						const emptySubdirPath = dirPath + "/empty-subdir";
						const emptySubdirUrl = filePathToUrl(emptySubdirPath);
						const result = await impl.delete(emptySubdirUrl);

						assert.strictEqual(
							await impl.isDirectory(emptySubdirPath),
							false,
						);
						assert.strictEqual(result, true);
					});

					it("should return false when the file doesn't exist", async () => {
						const filePath = dirPath + "/nonexistent.txt";
						const result = await impl.delete(filePath);

						assert.strictEqual(result, false);
					});

					it("should return false when the file doesn't exist at the file URL", async () => {
						const filePath = dirPath + "/nonexistent.txt";
						const fileUrl = filePathToUrl(filePath);
						const result = await impl.delete(fileUrl);

						assert.strictEqual(result, false);
					});

					it("should reject a promise when path is a nonempty directory", async () => {
						const subdirPath = dirPath + "/subdir";
						await assert.rejects(
							() => impl.delete(subdirPath),
							/ENOTEMPTY/,
						);
					});

					it("should reject a promise when path is a nonempty directory at the file URL", async () => {
						const subdirPath = dirPath + "/subdir";
						const subdirUrl = filePathToUrl(subdirPath);
						await assert.rejects(
							() => impl.delete(subdirUrl),
							/ENOTEMPTY/,
						);
					});
				});
			}

			describe("deleteAll()", () => {
				let dirPath = this.#outputDir + "/tmp-delete";

				beforeEach(async () => {
					await impl.createDirectory(dirPath);
					await impl.createDirectory(dirPath + "/subdir");
					await impl.createDirectory(dirPath + "/empty-subdir");
					await impl.createDirectory(dirPath + "/subdir/subsubdir");
					await impl.write(
						dirPath + "/subdir/subsubdir/test.txt",
						HELLO_WORLD_BYTES,
					);
				});

				afterEach(async () => {
					await impl.deleteAll(dirPath);
				});

				it("should delete a file", async () => {
					const filePath = dirPath + "/subdir/subsubdir/test.txt";
					const result = await impl.deleteAll(filePath);

					assert.strictEqual(await impl.isFile(filePath), false);
					assert.strictEqual(result, true);
				});

				it("should delete a file at the file URL", async () => {
					const filePath = dirPath + "/subdir/subsubdir/test.txt";
					const fileUrl = filePathToUrl(filePath);
					const result = await impl.deleteAll(fileUrl);

					assert.strictEqual(await impl.isFile(filePath), false);
					assert.strictEqual(result, true);
				});

				it("should delete a directory", async () => {
					const subsubdirPath = dirPath + "/subdir/subsubdir";
					const result = await impl.deleteAll(subsubdirPath);

					assert.strictEqual(
						await impl.isDirectory(subsubdirPath),
						false,
					);
					assert.strictEqual(result, true);
				});

				it("should delete a directory at the file URL", async () => {
					const subsubdirPath = dirPath + "/subdir/subsubdir";
					const subsubdirUrl = filePathToUrl(subsubdirPath);
					const result = await impl.deleteAll(subsubdirUrl);

					assert.strictEqual(
						await impl.isDirectory(subsubdirPath),
						false,
					);
					assert.strictEqual(result, true);
				});

				it("should delete a directory recursively", async () => {
					const subdirPath = dirPath + "/subdir";
					const result = await impl.deleteAll(subdirPath);

					assert.strictEqual(
						await impl.isDirectory(subdirPath),
						false,
					);
					assert.strictEqual(result, true);
				});

				it("should delete a directory recursively at the file URL", async () => {
					const subdirPath = dirPath + "/subdir";
					const subdirUrl = filePathToUrl(subdirPath);
					const result = await impl.deleteAll(subdirUrl);

					assert.strictEqual(
						await impl.isDirectory(subdirPath),
						false,
					);
					assert.strictEqual(result, true);
				});

				it("should return false when the file doesn't exist", async () => {
					const filePath = dirPath + "/nonexistent.txt";
					assert.strictEqual(await impl.isFile(filePath), false);

					const result = await impl.deleteAll(filePath);
					assert.strictEqual(result, false);
				});

				it("should return false when the file doesn't exist at the file URL", async () => {
					const filePath = dirPath + "/nonexistent.txt";
					const fileUrl = filePathToUrl(filePath);
					assert.strictEqual(await impl.isFile(filePath), false);

					const result = await impl.deleteAll(fileUrl);
					assert.strictEqual(result, false);
				});
			});

			if (impl.list) {
				if (!this.#expectedEntries) {
					throw new Error(
						"expectedEntries is required for testing list()",
					);
				}

				describe("list()", () => {
					it("should return an async iterable", async () => {
						const dirPath = this.#outputDir + "/tmp-list";
						await impl.createDirectory(dirPath + "/subdir");
						await impl.write(
							dirPath + "/test1.txt",
							HELLO_WORLD_BYTES,
						);
						await impl.write(
							dirPath + "/test2.txt",
							HELLO_WORLD_BYTES,
						);

						const result = await impl.list(dirPath);
						assert.ok(result[Symbol.asyncIterator]);
					});

					it("should return an async iterable when using a file URL", async () => {
						const dirPath = this.#outputDir + "/tmp-list";
						await impl.createDirectory(dirPath + "/subdir");
						await impl.write(
							dirPath + "/test1.txt",
							HELLO_WORLD_BYTES,
						);
						await impl.write(
							dirPath + "/test2.txt",
							HELLO_WORLD_BYTES,
						);

						const dirUrl = filePathToUrl(dirPath);
						const result = await impl.list(dirUrl);
						assert.ok(result[Symbol.asyncIterator]);
					});

					it("should list the contents of the top-level directory", async () => {
						const result = [];

						for await (const entry of impl.list(".")) {
							result.push(entry.name);
						}

						assert.deepStrictEqual(result, this.#expectedEntries);
					});

					it("should list the contents of a directory", async () => {
						const dirPath = this.#outputDir + "/tmp-list";
						await impl.createDirectory(dirPath + "/subdir");
						await impl.write(
							dirPath + "/test1.txt",
							HELLO_WORLD_BYTES,
						);
						await impl.write(
							dirPath + "/test2.txt",
							HELLO_WORLD_BYTES,
						);
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

							assert.strictEqual(
								item.isDirectory,
								entry.isDirectory,
							);
							assert.strictEqual(item.isFile, entry.isFile);
							assert.strictEqual(item.isSymlink, entry.isSymlink);
						}
					});

					it("should list the contents of a directory when using a file URL", async () => {
						const dirPath = this.#outputDir + "/tmp-list";
						await impl.createDirectory(dirPath + "/subdir");
						await impl.write(
							dirPath + "/test1.txt",
							HELLO_WORLD_BYTES,
						);
						await impl.write(
							dirPath + "/test2.txt",
							HELLO_WORLD_BYTES,
						);
						const dirUrl = filePathToUrl(dirPath);
						const result = [];

						for await (const entry of impl.list(dirUrl)) {
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

							assert.strictEqual(
								item.isDirectory,
								entry.isDirectory,
							);
							assert.strictEqual(item.isFile, entry.isFile);
							assert.strictEqual(item.isSymlink, entry.isSymlink);
						}
					});
				});
			}

			if (impl.size) {
				describe("size()", () => {
					it("should return the size of a file", async () => {
						const filePath = this.#outputDir + "/hello.txt";
						const result = await impl.size(filePath);
						assert.strictEqual(result, 13);
					});

					it("should return the size of a file when using a file URL", async () => {
						const filePath = this.#outputDir + "/hello.txt";
						const fileUrl = filePathToUrl(filePath);
						const result = await impl.size(fileUrl);
						assert.strictEqual(result, 13);
					});

					it("should return undefined if the file doesn't exist", async () => {
						const filePath = this.#outputDir + "/nonexistent.txt";
						const result = await impl.size(filePath);
						assert.strictEqual(result, undefined);
					});

					it("should return undefined if the file doesn't exist at the file URL", async () => {
						const filePath = this.#outputDir + "/nonexistent.txt";
						const fileUrl = filePathToUrl(filePath);
						const result = await impl.size(fileUrl);
						assert.strictEqual(result, undefined);
					});
				});
			}

			if (impl.lastModified) {
				describe("lastModified()", () => {
					it("should return the last modified date of a file", async () => {
						const filePath = this.#outputDir + "/hello.txt";
						const result = await impl.lastModified(filePath);
						assert.ok(result instanceof Date);
					});

					it("should return the last modified date of a directory", async () => {
						const result = await impl.lastModified(this.#outputDir);
						assert.ok(result instanceof Date);
					});

					it("should return the last modified date of a file when using a file URL", async () => {
						const filePath = this.#outputDir + "/hello.txt";
						const fileUrl = filePathToUrl(filePath);
						const result = await impl.lastModified(fileUrl);
						assert.ok(result instanceof Date);
					});

					it("should return undefined if the file doesn't exist", async () => {
						const filePath = this.#outputDir + "/nonexistent.txt";
						const result = await impl.lastModified(filePath);
						assert.strictEqual(result, undefined);
					});

					it("should return undefined if the directory doesn't exist", async () => {
						const dirPath = this.#outputDir + "/nonexistent";
						const result = await impl.lastModified(dirPath);
						assert.strictEqual(result, undefined);
					});

					it("should return undefined if the file doesn't exist at the file URL", async () => {
						const filePath = this.#outputDir + "/nonexistent.txt";
						const fileUrl = filePathToUrl(filePath);
						const result = await impl.lastModified(fileUrl);
						assert.strictEqual(result, undefined);
					});
				});
			}

			if (impl.copy) {
				describe("copy()", () => {
					let dirPath = this.#outputDir + "/tmp-copy";

					beforeEach(async () => {
						await impl.createDirectory(dirPath);
						await impl.createDirectory(dirPath + "/subdir");
						await impl.createDirectory(dirPath + "/empty-subdir");
						await impl.createDirectory(
							dirPath + "/subdir/subsubdir",
						);
						await impl.write(
							dirPath + "/subdir/subsubdir/test.txt",
							HELLO_WORLD_BYTES,
						);
					});

					afterEach(async () => {
						await impl.deleteAll(dirPath);
					});

					it("should copy a file", async () => {
						const sourcePath =
							dirPath + "/subdir/subsubdir/test.txt";
						const destPath =
							dirPath + "/subdir/subsubdir/test-copy.txt";
						await impl.copy(sourcePath, destPath);

						assert.strictEqual(await impl.isFile(destPath), true);
					});

					it("should copy a file at the file URL", async () => {
						const sourcePath =
							dirPath + "/subdir/subsubdir/test.txt";
						const destPath =
							dirPath + "/subdir/subsubdir/test-copy.txt";
						const sourceUrl = filePathToUrl(sourcePath);
						const destUrl = filePathToUrl(destPath);
						await impl.copy(sourceUrl, destUrl);

						assert.strictEqual(await impl.isFile(destPath), true);
					});

					it("should reject a promise when copying to a directory that doesn't exist", async () => {
						const sourcePath =
							dirPath + "/subdir/subsubdir/test.txt";
						const destPath = dirPath + "/nonexistent/test.txt";
						await assert.rejects(
							() => impl.copy(sourcePath, destPath),
							/ENOENT/,
						);
					});

					/*
					 * Different runtimes return different error codes
					 * when a directory is used in place of a file.
					 *
					 * Node.js on Windows: EPERM
					 * Node.js on macOS: ENOTSUP
					 * Node.js on Linux: EISDIR
					 * Deno: EPERM
					 *
					 * Unfortunately, that means we need to accept any of
					 * these errors for the following tests.
					 *
					 * Note: EISDIR is the most accurate error code but
					 * others are accepted for compatibility.
					 */

					it("should reject a promise when attempting to copy a directory", async () => {
						const sourcePath = dirPath + "/subdir";
						const destPath = dirPath + "/subdir-copy";
						await assert.rejects(
							() => impl.copy(sourcePath, destPath),
							/EISDIR|EPERM|ENOTSUP/,
						);
					});

					it("should reject a promise when attempting to copy a directory at the file URL", async () => {
						const sourcePath = dirPath + "/subdir";
						const destPath = dirPath + "/subdir-copy";
						const sourceUrl = filePathToUrl(sourcePath);
						const destUrl = filePathToUrl(destPath);
						await assert.rejects(
							() => impl.copy(sourceUrl, destUrl),
							/EISDIR|EPERM|ENOTSUP/,
						);
					});

					it("should reject a promise when the destination is a directory", async () => {
						const sourcePath =
							dirPath + "/subdir/subsubdir/test.txt";
						const destPath = dirPath + "/subdir";
						await assert.rejects(
							() => impl.copy(sourcePath, destPath),
							/EISDIR|EPERM|ENOTSUP/,
						);
					});

					it("should reject a promise when the source file doesn't exist", async () => {
						const sourcePath = dirPath + "/nonexistent.txt";
						const destPath = dirPath + "/nonexistent-copy.txt";
						await assert.rejects(
							() => impl.copy(sourcePath, destPath),
							/ENOENT/,
						);
					});
				});
			}

			if (impl.copyAll) {
				describe("copyAll()", () => {
					let dirPath = this.#outputDir + "/tmp-copy-all";

					beforeEach(async () => {
						await impl.createDirectory(dirPath);
						await impl.createDirectory(dirPath + "/subdir");
						await impl.createDirectory(dirPath + "/empty-subdir");
						await impl.createDirectory(
							dirPath + "/subdir/subsubdir",
						);
						await impl.write(
							dirPath + "/subdir/subsubdir/test.txt",
							HELLO_WORLD_BYTES,
						);
					});

					afterEach(async () => {
						await impl.deleteAll(dirPath);
					});

					it("should copy a file", async () => {
						const sourcePath =
							dirPath + "/subdir/subsubdir/test.txt";
						const destPath =
							dirPath + "/subdir/subsubdir/test-copy.txt";
						await impl.copyAll(sourcePath, destPath);

						assert.strictEqual(await impl.isFile(destPath), true);
					});

					it("should copy a file at the file URL", async () => {
						const sourcePath =
							dirPath + "/subdir/subsubdir/test.txt";
						const destPath =
							dirPath + "/subdir/subsubdir/test-copy.txt";
						const sourceUrl = filePathToUrl(sourcePath);
						const destUrl = filePathToUrl(destPath);
						await impl.copyAll(sourceUrl, destUrl);

						assert.strictEqual(await impl.isFile(destPath), true);
					});

					it("should copy a directory and its subdirectories", async () => {
						const sourcePath = dirPath + "/subdir";
						const destPath = dirPath + "/subdir-copy";
						await impl.copyAll(sourcePath, destPath);

						assert.strictEqual(
							await impl.isDirectory(destPath),
							true,
							"Destination should be a directory.",
						);
						assert.strictEqual(
							await impl.isDirectory(destPath + "/subsubdir"),
							true,
							"Destination should contain the subsubdir directory.",
						);
						assert.strictEqual(
							await impl.isFile(destPath + "/subsubdir/test.txt"),
							true,
							"Destination should contain subsubdir/test.txt.",
						);
					});

					it("should copy a directory and its subdirectories at the file URL", async () => {
						const sourcePath = dirPath + "/subdir";
						const destPath = dirPath + "/subdir-copy";
						const sourceUrl = filePathToUrl(sourcePath);
						const destUrl = filePathToUrl(destPath);
						await impl.copyAll(sourceUrl, destUrl);

						assert.strictEqual(
							await impl.isDirectory(destPath),
							true,
						);
						assert.strictEqual(
							await impl.isFile(destPath + "/subsubdir/test.txt"),
							true,
						);
					});

					it("should reject a promise when the source file doesn't exist", async () => {
						const sourcePath = dirPath + "/nonexistent.txt";
						const destPath = dirPath + "/nonexistent-copy.txt";
						await assert.rejects(
							() => impl.copyAll(sourcePath, destPath),
							/ENOENT/,
						);
					});
				});
			}

			if (impl.move) {
				describe("move()", () => {
					let dirPath = this.#outputDir + "/tmp-move";

					beforeEach(async () => {
						await impl.createDirectory(dirPath);
						await impl.createDirectory(dirPath + "/subdir");
						await impl.write(
							dirPath + "/test1.txt",
							HELLO_WORLD_BYTES,
						);
						await impl.write(
							dirPath + "/test2.txt",
							HELLO_WORLD_BYTES,
						);
					});

					afterEach(async () => {
						await impl.deleteAll(dirPath);
					});

					it("should move a file", async () => {
						const filePath = dirPath + "/test1.txt";
						const newFilePath = dirPath + "/test1-moved.txt";
						await impl.move(filePath, newFilePath);

						assert.strictEqual(await impl.isFile(filePath), false);
						assert.strictEqual(
							await impl.isFile(newFilePath),
							true,
						);

						const resultBytes = await impl.bytes(newFilePath);
						const text = new TextDecoder().decode(resultBytes);
						assert.strictEqual(text, HELLO_WORLD);
					});

					it("should move a file at the file URL", async () => {
						const filePath = dirPath + "/test1.txt";
						const newFilePath = dirPath + "/test1-moved.txt";
						const fileUrl = filePathToUrl(filePath);
						const newFileUrl = filePathToUrl(newFilePath);
						await impl.move(fileUrl, newFileUrl);

						assert.strictEqual(await impl.isFile(filePath), false);
						assert.strictEqual(
							await impl.isFile(newFilePath),
							true,
						);

						const resultBytes = await impl.bytes(newFilePath);
						const text = new TextDecoder().decode(resultBytes);
						assert.strictEqual(text, HELLO_WORLD);
					});

					it("should move a file to a new directory", async () => {
						const filePath = dirPath + "/test1.txt";
						const newFilePath = dirPath + "/subdir/test1.txt";
						await impl.move(filePath, newFilePath);

						assert.strictEqual(
							await impl.isFile(filePath),
							false,
							"File should not exist at the old location.",
						);
						assert.strictEqual(
							await impl.isFile(newFilePath),
							true,
							"File should exist at the new location.",
						);

						const resultBytes = await impl.bytes(newFilePath);
						const text = new TextDecoder().decode(resultBytes);
						assert.strictEqual(
							text,
							HELLO_WORLD,
							"The file should contain the correct contents at the new location.",
						);
					});

					it("should reject a promise when the source file doesn't exist", async () => {
						const filePath = dirPath + "/nonexistent.txt";
						const newFilePath = dirPath + "/nonexistent-moved.txt";
						await assert.rejects(
							() => impl.move(filePath, newFilePath),
							/ENOENT/,
						);
					});

					it("should reject a promise when the source is a directory", async () => {
						const subdirPath = dirPath + "/subdir";
						const newFilePath = dirPath + "/subdir-moved";
						await assert.rejects(
							() => impl.move(subdirPath, newFilePath),
							/EISDIR|EPERM|ENOTSUP/,
						);
					});
				});
			}

			if (impl.moveAll) {
				describe("moveAll()", () => {
					let dirPath = this.#outputDir + "/tmp-move-all";

					beforeEach(async () => {
						await impl.createDirectory(dirPath);
						await impl.createDirectory(dirPath + "/subdir");
						await impl.write(
							dirPath + "/test1.txt",
							HELLO_WORLD_BYTES,
						);
						await impl.write(
							dirPath + "/test2.txt",
							HELLO_WORLD_BYTES,
						);
						await impl.write(
							dirPath + "/subdir/test3.txt",
							HELLO_WORLD_BYTES,
						);
					});

					afterEach(async () => {
						await impl.deleteAll(dirPath);
					});

					it("should move a file", async () => {
						const sourcePath = dirPath + "/test1.txt";
						const destPath = dirPath + "/test1-moved.txt";
						await impl.moveAll(sourcePath, destPath);

						assert.strictEqual(
							await impl.isFile(sourcePath),
							false,
						);
						assert.strictEqual(await impl.isFile(destPath), true);

						const resultBytes = await impl.bytes(destPath);
						const text = new TextDecoder().decode(resultBytes);
						assert.strictEqual(text, HELLO_WORLD);
					});

					it("should move a file at the file URL", async () => {
						const sourcePath = dirPath + "/test1.txt";
						const destPath = dirPath + "/test1-moved.txt";
						const sourceUrl = filePathToUrl(sourcePath);
						const destUrl = filePathToUrl(destPath);
						await impl.moveAll(sourceUrl, destUrl);

						assert.strictEqual(
							await impl.isFile(sourcePath),
							false,
						);
						assert.strictEqual(await impl.isFile(destPath), true);

						const resultBytes = await impl.bytes(destPath);
						const text = new TextDecoder().decode(resultBytes);
						assert.strictEqual(text, HELLO_WORLD);
					});

					it("should move a file to a new directory", async () => {
						const sourcePath = dirPath + "/test1.txt";
						const destPath = dirPath + "/subdir/test1.txt";
						await impl.moveAll(sourcePath, destPath);

						assert.strictEqual(
							await impl.isFile(sourcePath),
							false,
							"File should not exist at the old location.",
						);
						assert.strictEqual(
							await impl.isFile(destPath),
							true,
							"File should exist at the new location.",
						);

						const resultBytes = await impl.bytes(destPath);
						const text = new TextDecoder().decode(resultBytes);
						assert.strictEqual(
							text,
							HELLO_WORLD,
							"The file should contain the correct contents at the new location.",
						);
					});

					it("should reject a promise when the source doesn't exist", async () => {
						const sourcePath = dirPath + "/nonexistent.txt";
						const destPath = dirPath + "/nonexistent-moved.txt";
						await assert.rejects(
							() => impl.moveAll(sourcePath, destPath),
							/ENOENT/,
						);
					});

					it("should move a directory to a new directory", async () => {
						const sourcePath = dirPath + "/subdir";
						const destPath = dirPath + "/subdir-moved";
						await impl.moveAll(sourcePath, destPath);

						assert.strictEqual(
							await impl.isDirectory(sourcePath),
							false,
							"Directory should not exist at the old location.",
						);
						assert.strictEqual(
							await impl.isDirectory(destPath),
							true,
							"Directory should exist at the new location.",
						);

						const resultBytes = await impl.bytes(
							destPath + "/test3.txt",
						);
						const text = new TextDecoder().decode(resultBytes);
						assert.strictEqual(text, HELLO_WORLD); //, "The file should contain the correct contents at the new location.");
					});
				});
			}
		});
	}
}
