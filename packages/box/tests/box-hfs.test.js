/**
 * @fileoverview Tests for the Hfs class.
 * @author Nicholas C. Zakas
 */

/*global describe, it */

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
		server.listen()
	});

	after(() => {
		server.close();
	});

	await tester.test({
		name: "BoxHfsImpl",
		impl: new BoxHfsImpl({ token: "abc123", rootFolderId: "dir-0" }),
	});

});


// describe("BoxHfsImpl Customizations", () => {
// 	describe("list()", () => {
// 		it("should list files at the root directory", async () => {

// 			const impl = new BoxHfsImpl({ token: process.env.BOX_TOKEN });
			
// 			for await (const entry of impl.list(".")) {
// 				console.log(entry);
// 			}

// 		});

// 		it("should list files in a folder directory", async () => {

// 			const impl = new BoxHfsImpl({ token: process.env.BOX_TOKEN });
			
// 			for await (const entry of impl.list("Taxes")) {
// 				console.log(entry);
// 			}

// 		});

// 		it("should list files in a folder directory", async () => {

// 			const impl = new BoxHfsImpl({ token: process.env.BOX_TOKEN });
			
// 			for await (const entry of impl.list("Taxes/Taxes 2020")) {
// 				console.log(entry);
// 			}

// 		});
// 	});

// 	describe("size()", () => {
// 		it("should return the last modified date of a file", async () => {
// 			const impl = new BoxHfsImpl({ token: process.env.BOX_TOKEN });
// 			const size = await impl.size("Taxes/Taxes 2020/TAX RETURN '20.pdf");
// 			console.log(size);
// 		});
// 	});

// 	describe("isFile()", () => {
// 		it("should return true for a file", async () => {
// 			const impl = new BoxHfsImpl({ token: process.env.BOX_TOKEN });
// 			const isFile = await impl.isFile("Taxes/Taxes 2020/TAX RETURN '20.pdf");
// 			console.log(isFile);
// 		});

// 		it("should return false for a directory", async () => {
// 			const impl = new BoxHfsImpl({ token: process.env.BOX_TOKEN });
// 			const isFile = await impl.isFile("Taxes/Taxes 2020");
// 			console.log(isFile);
// 		});

// 		it("should return false for a non-existent file", async () => {
// 			const impl = new BoxHfsImpl({ token: process.env.BOX_TOKEN });
// 			const isFile = await impl.isFile("Taxes/Taxes 2020/Non-existent file.pdf");
// 			console.log(isFile);
// 		});
// 	});

// 	describe("isDirectory()", () => {
// 		it("should return false for a file", async () => {
// 			const impl = new BoxHfsImpl({ token: process.env.BOX_TOKEN });
// 			const isDirectory = await impl.isDirectory("Taxes/Taxes 2020/TAX RETURN '20.pdf");
// 			assert.strictEqual(isDirectory, false);
// 		});

// 		it("should return true for a directory", async () => {
// 			const impl = new BoxHfsImpl({ token: process.env.BOX_TOKEN });
// 			const isDirectory = await impl.isDirectory("Taxes/Taxes 2020");
// 			assert.strictEqual(isDirectory, true);
// 		});

// 		it("should return false for a non-existent file", async () => {
// 			const impl = new BoxHfsImpl({ token: process.env.BOX_TOKEN });
// 			const isDirectory = await impl.isDirectory("Taxes/Taxes 2020/Non-existent file.pdf");
// 			assert.strictEqual(isDirectory, false);
// 		});
// 	});


// 	describe("createDirectory()", () => {
// 		it("should should create a directory", async () => {
// 			const impl = new BoxHfsImpl({ token: process.env.BOX_TOKEN });
// 			const text = await impl.createDirectory("Test Dir/2021");
// 		});
// 	});

// 	describe("write()", () => {
// 		it("should write a file", async () => {
// 			const impl = new BoxHfsImpl({ token: process.env.BOX_TOKEN });
// 			const text = await impl.write("Test Dir/2023/hello3.txt", "Goodbye, World!2");
// 		});
// 	});

// 	describe("delete()", () => {
// 		it("should delete a file", async () => {
// 			const impl = new BoxHfsImpl({ token: process.env.BOX_TOKEN });
// 			await impl.delete("Test Dir/2023/hello2.txt");
// 		});

// 		it("should delete an empty directory", async () => {
// 			const impl = new BoxHfsImpl({ token: process.env.BOX_TOKEN });
// 			await impl.delete("Test Dir/2023");
// 		});

// 		it("should throw an error when deleting a non-empty directory", async () => {
// 			const impl = new BoxHfsImpl({ token: process.env.BOX_TOKEN });
// 			await assert.rejects(() => impl.delete("Test Dir"), /ENOTEMPTY/);
// 		});
// 	});

// 	describe("copy()", () => {
// 		it("should copy a file", async () => {
// 			const impl = new BoxHfsImpl({ token: process.env.BOX_TOKEN });
// 			await impl.copy("Test Dir/2021/hello.txt", "Test Dir/2022/hello-copy.txt");
// 		});
// 	});

// 	describe("copyAll()", () => {
// 		it("should copy a directory", async () => {
// 			const impl = new BoxHfsImpl({ token: process.env.BOX_TOKEN });
// 			await impl.copyAll("Test Dir/2021", "Test Dir/2021 copy");
// 		});
// 	});

// 	describe("move()", () => {
// 		it("should move a file", async () => {
// 			const impl = new BoxHfsImpl({ token: process.env.BOX_TOKEN });
// 			await impl.move("Test Dir/2022/hello-copy.txt", "Test Dir/2023/hello2.txt");
// 		});
// 	});

// 	describe.only("moveAll()", () => {
// 		it("should move a directory", async () => {
// 			const impl = new BoxHfsImpl({ token: process.env.BOX_TOKEN });
// 			await impl.moveAll("Test Dir/2021 copy", "Test Dir/2021 moved");
// 		});
// 	});

// });
