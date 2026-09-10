/**
 * @fileoverview Tests for the Hfs class.
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
import { DenoHfsImpl, DenoHfs } from "../src/deno-hfs.js";
import { HfsImplTester } from "../../test/src/index.js";
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

const encoder = new TextEncoder();
const HELLO_WORLD = "Hello, world!";
const HELLO_WORLD_BYTES = encoder.encode(HELLO_WORLD);

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const tester = new HfsImplTester({
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
	expectedEntries: (await Array.fromAsync(Deno.readDir("."))).map(
		entry => entry.name,
	),
});

await tester.test({
	name: "DenoHfsImpl",
	impl: new DenoHfsImpl(),
});

describe("DenoHfsImpl Customizations", () => {
	describe("isFile()", () => {
		it("should return false when a file isn't present", async () => {
			const impl = new DenoHfsImpl();
			const result = await impl.isFile("foo.txt");
			assertEquals(result, false);
		});

		it("should rethrow an error that isn't ENOENT", async () => {
			const impl = new DenoHfsImpl({
				deno: {
					async stat() {
						throw new Error("Boom!");
					},
				},
			});
			await assertRejects(() => impl.isFile("foo.txt"), /Boom!/);
		});
	});

	describe("isDirectory()", () => {
		it("should return false when a file isn't present", async () => {
			const impl = new DenoHfsImpl();
			const result = await impl.isDirectory(".hfs/foo");
			assertEquals(result, false);
		});

		it("should rethrow an error that isn't ENOENT", async () => {
			const impl = new DenoHfsImpl({
				deno: {
					async stat() {
						throw new Error("Boom!");
					},
				},
			});
			await assertRejects(() => impl.isDirectory(".hfs/foo"), /Boom!/);
		});
	});

	describe("bytes()", () => {
		it("should return contents when ENFILE error occurs", async () => {
			const contents = new TextEncoder().encode("Hello world!");
			let callCount = 0;
			const impl = new DenoHfsImpl({
				deno: {
					async readFile() {
						if (callCount === 0) {
							callCount++;
							const error = new Error(
								"ENFILE: file table overflow",
							);
							error.code = "ENFILE";
							throw error;
						}

						return new Uint8Array(contents);
					},
				},
			});

			const result = await impl.bytes(".hfs/foo");
			assertEquals(result, contents);
		});

		it("should return contents when EMFILE error occurs", async () => {
			const contents = new TextEncoder().encode("Hello world!");
			let callCount = 0;
			const impl = new DenoHfsImpl({
				deno: {
					async readFile() {
						if (callCount === 0) {
							callCount++;
							const error = new Error(
								"EMFILE: file table overflow",
							);
							error.code = "EMFILE";
							throw error;
						}

						return new Uint8Array(contents);
					},
				},
			});

			const result = await impl.bytes(".hfs/foo");
			assertEquals(result, contents);
		});

		it("should return text contents when EMFILE error occurs multiple times", async () => {
			const contents = new TextEncoder().encode("Hello world!");
			let callCount = 0;
			const impl = new DenoHfsImpl({
				deno: {
					async readFile() {
						if (callCount < 3) {
							callCount++;
							const error = new Error(
								"EMFILE: file table overflow",
							);
							error.code = "EMFILE";
							throw error;
						}

						return new Uint8Array(contents);
					},
				},
			});

			const result = await impl.bytes(".hfs/foo");
			assertEquals(result, contents);
		});

		it("should rethrow an error that isn't ENFILE", async () => {
			const impl = new DenoHfsImpl({
				deno: {
					async readFile() {
						throw new Error("Boom!");
					},
				},
			});
			await assertRejects(() => impl.bytes(".hfs/foo"), /Boom!/);
		});
	});

	describe("write()", () => {
		it("should return contents when ENFILE error occurs", async () => {
			let callCount = 0;
			let success = false;
			const impl = new DenoHfsImpl({
				deno: {
					async writeFile() {
						if (callCount === 0) {
							callCount++;
							const error = new Error(
								"ENFILE: file table overflow",
							);
							error.code = "ENFILE";
							throw error;
						}

						success = true;
					},
				},
			});

			await impl.write(".hfs/foo", HELLO_WORLD_BYTES);
			assert(success);
		});

		it("should return contents when EMFILE error occurs", async () => {
			let callCount = 0;
			let success = false;
			const impl = new DenoHfsImpl({
				deno: {
					async writeFile() {
						if (callCount === 0) {
							callCount++;
							const error = new Error(
								"EMFILE: file table overflow",
							);
							error.code = "EMFILE";
							throw error;
						}

						success = true;
					},
				},
			});

			await impl.write(".hfs/foo", HELLO_WORLD_BYTES);
			assert(success);
		});

		it("should return text contents when EMFILE error occurs multiple times", async () => {
			let callCount = 0;
			let success = false;
			const impl = new DenoHfsImpl({
				deno: {
					async writeFile() {
						if (callCount < 3) {
							callCount++;
							const error = new Error(
								"EMFILE: file table overflow",
							);
							error.code = "EMFILE";
							throw error;
						}

						success = true;
					},
				},
			});

			await impl.write(".hfs/foo", HELLO_WORLD_BYTES);
			assert(success);
		});

		it("should rethrow an error that isn't ENFILE", async () => {
			const impl = new DenoHfsImpl({
				deno: {
					async writeFile() {
						throw new Error("Boom!");
					},
				},
			});
			await assertRejects(
				() => impl.write(".hfs/foo", HELLO_WORLD_BYTES),
				/Boom!/,
			);
		});
	});

	describe("walk()", () => {
		it("should not throw when a directory is deleted before it is listed", async () => {
			const tmpDir = await Deno.makeTempDir({
				prefix: "humanfs-walk-enoent-",
			});

			try {
				const subdir = path.join(tmpDir, "subdir");
				await Deno.mkdir(subdir);
				await Deno.writeTextFile(
					path.join(subdir, "inside.txt"),
					"hello",
				);
				await Deno.writeTextFile(
					path.join(tmpDir, "file.txt"),
					"hello",
				);

				const hfs = new DenoHfs();
				const paths = [];

				for await (const entry of hfs.walk(tmpDir, {
					// simulate another process deleting the directory after
					// it was found but before walk() lists its contents
					async directoryFilter(entry) {
						if (entry.name === "subdir") {
							await Deno.remove(subdir, { recursive: true });
						}
						return true;
					},
				})) {
					paths.push(entry.path);
				}

				assertEquals(paths.sort(), ["file.txt", "subdir"]);
			} finally {
				await Deno.remove(tmpDir, { recursive: true });
			}
		});

		/**
		 * Creates a temp directory with this layout:
		 *
		 * 	target/inside.txt
		 * 	dir-link -> target
		 * 	file-link -> target/inside.txt
		 * 	broken-link -> missing
		 *
		 * @returns {Promise<string|undefined>} The temp directory path, or
		 * 	undefined if symlinks can't be created on this system.
		 */
		async function createSymlinkFixture() {
			const tmpDir = await Deno.makeTempDir({
				prefix: "humanfs-walk-symlink-",
			});
			const target = path.join(tmpDir, "target");

			await Deno.mkdir(target);
			await Deno.writeTextFile(path.join(target, "inside.txt"), "hello");

			try {
				await Deno.symlink(target, path.join(tmpDir, "dir-link"), {
					type: "dir",
				});
				await Deno.symlink(
					path.join(target, "inside.txt"),
					path.join(tmpDir, "file-link"),
					{ type: "file" },
				);
				await Deno.symlink(
					path.join(tmpDir, "missing"),
					path.join(tmpDir, "broken-link"),
					{ type: "file" },
				);
			} catch (err) {
				if (
					err instanceof Deno.errors.PermissionDenied ||
					err.code === "EPERM"
				) {
					await Deno.remove(tmpDir, { recursive: true });
					return undefined; // symlinks require elevated privileges on this OS; skip
				}
				throw err;
			}

			return tmpDir;
		}

		async function collectPaths(dirPath, options) {
			const hfs = new DenoHfs();
			const paths = [];

			for await (const entry of hfs.walk(dirPath, options)) {
				paths.push(entry.path);
			}

			return paths.sort();
		}

		it("should not walk into symlinked directories by default", async () => {
			const tmpDir = await createSymlinkFixture();
			if (!tmpDir) {
				return;
			}

			try {
				const paths = await collectPaths(tmpDir);

				assertEquals(paths, [
					"broken-link",
					"dir-link",
					"file-link",
					"target",
					"target/inside.txt",
				]);
			} finally {
				await Deno.remove(tmpDir, { recursive: true });
			}
		});

		it("should walk into symlinked directories when followSymlinks is true", async () => {
			const tmpDir = await createSymlinkFixture();
			if (!tmpDir) {
				return;
			}

			try {
				const paths = await collectPaths(tmpDir, {
					followSymlinks: true,
				});

				assertEquals(paths, [
					"broken-link",
					"dir-link",
					"dir-link/inside.txt",
					"file-link",
					"target",
					"target/inside.txt",
				]);
			} finally {
				await Deno.remove(tmpDir, { recursive: true });
			}
		});

		it("should walk into symlinked directories when followSymlinks is true and passed a URL", async () => {
			const tmpDir = await createSymlinkFixture();
			if (!tmpDir) {
				return;
			}

			try {
				const paths = await collectPaths(path.toFileUrl(tmpDir), {
					followSymlinks: true,
				});

				assertEquals(paths, [
					"broken-link",
					"dir-link",
					"dir-link/inside.txt",
					"file-link",
					"target",
					"target/inside.txt",
				]);
			} finally {
				await Deno.remove(tmpDir, { recursive: true });
			}
		});
	});
});
