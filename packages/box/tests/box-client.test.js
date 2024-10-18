/**
 * @fileoverview BoxClient test suite
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import assert from "assert";
import { BoxClient, API_BASE, API_ENDPOINTS } from "../src/box-client.js";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { Path } from "@humanfs/core";
import sinon from "sinon";

//-----------------------------------------------------------------------------
// Setup
//-----------------------------------------------------------------------------

function createApiUrl(endpoint) {
    return API_BASE + endpoint;
}

describe("BoxClient", () => {

    let server;

    before(() => {
        server = setupServer();
        server.listen();
    });

    afterEach(() => {
        server.resetHandlers();
    });

    after(() => {
        server.close();
    });

    describe("new BoxClient", () => {
        
        it("should throw an error when the token is missing", () => {
            assert.throws(() => {
                new BoxClient({ token: "" });
            }, /Token must be provided/);
        });

        it("should throw an error when the token is not a string", () => {
            assert.throws(() => {
                new BoxClient({ token: 123 });
            }, /Token must be a string/);
        });

    });

    describe("copyFile()", () => {

        let client;

        before(() => {
            client = new BoxClient({
                token: "123"
            });
        });

        it("should pass the correct Authorization header", async () => {

            const handler = sinon.fake.resolves(HttpResponse.json({ id: "new-file-id", name: "new-file.txt", type: "file" }));

            server.use(
                http.post(createApiUrl(API_ENDPOINTS.copyFile), handler)
            );

            await client.copyFile("file1", "folder2");

            assert.strictEqual(handler.calledOnce, true);

            const headers = handler.firstCall.args[0].request.headers;
            assert.strictEqual(headers.get("Authorization"), "Bearer 123");
        });

        it("should pass the file ID and new parent ID as parameters", async () => {

            const handler = sinon.fake.resolves(HttpResponse.json({ id: "new-file-id", name: "new-file.txt", type: "file" }));

            server.use(
                http.post(createApiUrl(API_ENDPOINTS.copyFile), handler)
            );

            await client.copyFile("file1", "folder2");

            assert.strictEqual(handler.calledOnce, true);
            const params = handler.firstCall.args[0].params;
            assert.strictEqual(params.file_id, "file1");
            const body = await handler.firstCall.args[0].request.json();
            assert.strictEqual(body.parent.id, "folder2");
        });

        it("should return the result from the API", async () => {

            server.use(
                http.post(createApiUrl(API_ENDPOINTS.copyFile), async () => {
                    return HttpResponse.json({ id: "new-file-id", name: "new-file.txt", type: "file" });
                })
            );

            const object = await client.copyFile("file1", "folder2");
            assert.deepStrictEqual(object, { id: "new-file-id", name: "new-file.txt", type: "file" });
        });

        it("should reject a promise when the server returns a non-OK response", async () => {

            server.use(
                http.post(createApiUrl(API_ENDPOINTS.copyFile), async () => {
                    return new HttpResponse("Unauthorized", {
                        status: 401
                    });
                })
            );

            await assert.rejects(() => client.copyFile("file1", "folder2"), /401/);
        });

    });

    describe("copyFolder()", () => {

        let client;

        before(() => {
            client = new BoxClient({
                token: "123"
            });
        });

        it("should pass the correct Authorization header", async () => {

            const handler = sinon.fake.resolves(HttpResponse.json({ id: "new-folder-id", name: "new-folder", type: "folder" }));

            server.use(
                http.post(createApiUrl(API_ENDPOINTS.copyFolder), handler)
            );

            await client.copyFolder("folder1", "folder2");

            assert.strictEqual(handler.calledOnce, true);

            const headers = handler.firstCall.args[0].request.headers;
            assert.strictEqual(headers.get("Authorization"), "Bearer 123");
        });

        it("should pass the folder ID and new parent ID as parameters", async () => {

            const handler = sinon.fake.resolves(HttpResponse.json({ id: "new-folder-id", name: "new-folder", type: "folder" }));

            server.use(
                http.post(createApiUrl(API_ENDPOINTS.copyFolder), handler)
            );

            await client.copyFolder("folder1", "folder2");

            assert.strictEqual(handler.calledOnce, true);
            const params = handler.firstCall.args[0].params;
            assert.strictEqual(params.folder_id, "folder1");
            const body = await handler.firstCall.args[0].request.json();
            assert.strictEqual(body.parent.id, "folder2");
        });

        it("should return the result from the API", async () => {

            server.use(
                http.post(createApiUrl(API_ENDPOINTS.copyFolder), async () => {
                    return HttpResponse.json({ id: "new-folder-id", name: "new-folder", type: "folder" });
                })
            );

            const object = await client.copyFolder("folder1", "folder2");
            assert.deepStrictEqual(object, { id: "new-folder-id", name: "new-folder", type: "folder" });
        });

        it("should reject a promise when the server returns a non-OK response", async () => {

            server.use(
                http.post(createApiUrl(API_ENDPOINTS.copyFolder), async () => {
                    return new HttpResponse("Unauthorized", {
                        status: 401
                    });
                })
            );

            await assert.rejects(() => client.copyFolder("folder1", "folder2"), /401/);
        });

    });

    describe("createFolder()", () => {

        let client;
        const parentId = "folder1";
        const folderName = "new-folder";
        const expectedObject = { id: "new-folder-id", name: folderName, type: "folder" };

        before(() => {
            client = new BoxClient({ token: "123" });
        });

        it("should pass the correct Authorization and content-type headers", async () => {

            const handler = sinon.fake.resolves(HttpResponse.json(expectedObject));

            server.use(
                http.post(createApiUrl(API_ENDPOINTS.folders), handler)
            );
            
            await client.createFolder(folderName, parentId);

            assert.strictEqual(handler.calledOnce, true);

            const headers = handler.firstCall.args[0].request.headers;
            assert.strictEqual(headers.get("Authorization"), "Bearer 123");
            assert.strictEqual(headers.get("Content-Type"), "application/json");
        });

        it("should pass the correct body to the API", async () => {

            const handler = sinon.fake.resolves(HttpResponse.json(expectedObject));

            server.use(
                http.post(createApiUrl(API_ENDPOINTS.folders), handler)
            );

            await client.createFolder(folderName, parentId);

            assert.strictEqual(handler.calledOnce, true);
            const body = await handler.firstCall.args[0].request.json();
            assert.deepStrictEqual(body, { name: folderName, parent: { id: parentId } });
        });

        it("should create a folder with the given name", async () => {

            server.use(
                http.post(createApiUrl(API_ENDPOINTS.folders), async () => {
                    return HttpResponse.json(expectedObject);
                })
            );

            const object = await client.createFolder(folderName, parentId);
            assert.deepStrictEqual(object, expectedObject);
        });

        it("should throw an error when the server returns a non-OK response", async () => {
            server.use(
                http.post(createApiUrl(API_ENDPOINTS.folders), async () => {
                    return HttpResponse.error();
                })
            );

            await assert.rejects(() => client.createFolder("new-folder", "folder1"));
        });
    });

    describe("deleteFile()", () => {
        let client;

        before(() => {
            client = new BoxClient({
                token: "123"
            });
        });

        it("should pass the correct Authorization header", async () => {
            
            const handler = sinon.fake.resolves(new HttpResponse(204));

            server.use(
                http.delete(createApiUrl(API_ENDPOINTS.updateFile), handler)
            );

            await client.deleteFile("file1");

            assert.strictEqual(handler.calledOnce, true);

            const headers = handler.firstCall.args[0].request.headers;
            assert.strictEqual(headers.get("Authorization"), "Bearer 123");
        });

        it("should pass the file ID to the API", async () => {
            const fileId = "file1";
            const handler = sinon.fake.resolves(new HttpResponse(204));

            server.use(
                http.delete(createApiUrl(API_ENDPOINTS.updateFile), handler)
            );

            await client.deleteFile(fileId);

            assert.strictEqual(handler.calledOnce, true);
            const params = handler.firstCall.args[0].params;
            assert.strictEqual(params.file_id, fileId);
        });

        it("should delete a file", async () => {
            const fileId = "file1";

            server.use(
                http.delete(createApiUrl(API_ENDPOINTS.updateFile), async ({ params, request }) => {
                    return new HttpResponse(204);
                })
            );

            await client.deleteFile(fileId);
        });

        it("should throw an error when the server returns a non-OK response", async () => {
            server.use(
                http.delete(createApiUrl(API_ENDPOINTS.updateFile), async () => {
                    return new HttpResponse("Unauthorized", {
                        status: 401
                    });
                })
            );

            await assert.rejects(() => client.deleteFile("file1"), /401/);
        });

    });

    describe("deleteFolder()", () => {
        let client;

        before(() => {
            client = new BoxClient({
                token: "123"
            });
        });

        it("should pass the correct Authorization header", async () => {

            const handler = sinon.fake.resolves(new HttpResponse(204));

            server.use(
                http.delete(createApiUrl(API_ENDPOINTS.updateFolder), handler)
            );

            await client.deleteFolder("folder1");

            assert.strictEqual(handler.calledOnce, true);

            const headers = handler.firstCall.args[0].request.headers;
            assert.strictEqual(headers.get("Authorization"), "Bearer 123");
        });

        it("should pass the correct folder ID as a parameter", async () => {
            const folderId = "folder1";
            const handler = sinon.fake.resolves(new HttpResponse(204));

            server.use(
                http.delete(createApiUrl(API_ENDPOINTS.updateFolder), handler)
            );

            await client.deleteFolder(folderId);

            assert.strictEqual(handler.calledOnce, true);
            const params = handler.firstCall.args[0].params;
            assert.strictEqual(params.folder_id, folderId);
        });

        it("should delete a folder", async () => {
            const folderId = "folder1";

            server.use(
                http.delete(createApiUrl(API_ENDPOINTS.updateFolder), async ({ params, request }) => {
                    return new HttpResponse(204);
                })
            );

            await client.deleteFolder(folderId);
        });

        it("should throw an error when the server returns a non-OK response", async () => {
            server.use(
                http.delete(createApiUrl(API_ENDPOINTS.updateFolder), async () => {
                    return new HttpResponse("Unauthorized", {
                        status: 401
                    });

                })
            );

            await assert.rejects(() => client.deleteFolder("folder1"), /401/);
        });

    });

    describe("download()", () => {
        const fileId = "file1";
        const fileContent = "File content";
        let client;

        before(() => {
            client = new BoxClient({ token: "123" });
        });

        it("should pass the correct Authorization header", async () => {

            const handler = sinon.fake.resolves(HttpResponse.text(fileContent));

            server.use(
                http.get(createApiUrl(API_ENDPOINTS.file), handler)
            );

            await client.download(fileId);

            assert.strictEqual(handler.calledOnce, true);

            const headers = handler.firstCall.args[0].request.headers;
            assert.strictEqual(headers.get("Authorization"), "Bearer 123");
        });

        it("should include the file ID as a parameter", async () => {

            const handler = sinon.fake.resolves(HttpResponse.text(fileContent));

            server.use(
                http.get(createApiUrl(API_ENDPOINTS.file), handler)
            );

            await client.download(fileId);

            assert.strictEqual(handler.calledOnce, true);
            const params = handler.firstCall.args[0].params;
            assert.strictEqual(params.file_id, fileId);
        });

        it("should return the file content", async () => {
            server.use(
                http.get(createApiUrl(API_ENDPOINTS.file), async ({ params, request }) => {
                    return HttpResponse.text(fileContent);
                })
            );

            const response = await client.download(fileId);
            const responseContent = await response.text();
            assert.strictEqual(responseContent, fileContent);
        });



    });

    describe("fetchFolderItems()", () => {
        const folderId = "folder1";
        const mockResponse1 = {
            items: [
                { id: "file1", name: "file1.txt", type: "file" },
                { id: "file2", name: "file2.txt", type: "file" },
                { id: "folder1", name: "folder1", type: "folder" },

            ],
        };

        let client;

        before(() => {
            client = new BoxClient({ token: "123" });
        });

        it("should pass the correct Authorization header", async () => {

            const handler = sinon.fake.resolves(HttpResponse.json(mockResponse1));

            server.use(
                http.get(createApiUrl(API_ENDPOINTS.folderItems), handler)
            );

            await client.fetchFolderItems(folderId);

            assert.strictEqual(handler.calledOnce, true);

            const headers = handler.firstCall.args[0].request.headers;
            assert.strictEqual(headers.get("Authorization"), "Bearer 123");
        });

        it("should pass the folder ID as a parameter", async () => {

            const handler = sinon.fake.resolves(HttpResponse.json(mockResponse1));
            
            server.use(
                http.get(createApiUrl(API_ENDPOINTS.folderItems), handler)
            );

            await client.fetchFolderItems(folderId);

            assert.strictEqual(handler.calledOnce, true);
            const params = handler.firstCall.args[0].params;
            assert.strictEqual(params.folder_id, folderId);
        });

        it("should pass defaults for limit and marker as search params", async () => {

            const handler = sinon.fake.resolves(HttpResponse.json(mockResponse1));

            server.use(
                http.get(createApiUrl(API_ENDPOINTS.folderItems), handler)
            );

            await client.fetchFolderItems(folderId);

            assert.strictEqual(handler.calledOnce, true);
            const requestUrl = new URL(handler.firstCall.args[0].request.url);
            assert.strictEqual(requestUrl.searchParams.get("limit"), "100");
            assert.strictEqual(requestUrl.searchParams.get("marker"), null);
        });

        it("should pass custom options for limit and marker as search params", async () => {

            const customOptions = { limit: "50", marker: "abc123" };
            const handler = sinon.fake.resolves(HttpResponse.json(mockResponse1));

            server.use(
                http.get(createApiUrl(API_ENDPOINTS.folderItems), handler)
            );

            await client.fetchFolderItems(folderId, customOptions);

            assert.strictEqual(handler.calledOnce, true);
            const requestUrl = new URL(handler.firstCall.args[0].request.url);
            assert.strictEqual(requestUrl.searchParams.get("limit"), customOptions.limit);
            assert.strictEqual(requestUrl.searchParams.get("marker"), customOptions.marker);
        });

        it("should fetch folder items", async () => {
            server.use(
                http.get(createApiUrl(API_ENDPOINTS.folderItems), async () => {
                    return HttpResponse.json(mockResponse1);
                })
            );

            const response = await client.fetchFolderItems(folderId);
            assert.deepStrictEqual(response, mockResponse1);
        });

    });

    describe("findObject()", () => {
        let client;

        before(() => {
            client = new BoxClient({ token: "123" });
        });

        it("should pass the correct Authorization header", async () => {

            const fileOrDirPath = Path.from("/file1.txt");
            const expectedObject = { id: "file1", name: "file1.txt", type: "file" };
            const handler = sinon.fake.resolves(HttpResponse.json({ entries: [expectedObject] }));

            server.use(
                http.get(createApiUrl(API_ENDPOINTS.folderItems), handler)
            );

            await client.findObject(fileOrDirPath);

            assert.strictEqual(handler.calledOnce, true);

            const headers = handler.firstCall.args[0].request.headers;
            assert.strictEqual(headers.get("Authorization"), "Bearer 123");
        });

        it("should pass the correct folder ID as a parameter", async () => {

            const fileOrDirPath = Path.from("/file1.txt");
            const expectedObject = { id: "file1", name: "file1.txt", type: "file" };
            const handler = sinon.fake.resolves(HttpResponse.json({ entries: [expectedObject] }));

            server.use(
                http.get(createApiUrl(API_ENDPOINTS.folderItems), handler)
            );

            await client.findObject(fileOrDirPath);

            assert.strictEqual(handler.calledOnce, true);
            const params = handler.firstCall.args[0].params;
            assert.strictEqual(params.folder_id, "0");
        });

        it("should find the object when it exists at the root", async () => {
            const fileOrDirPath = Path.from("/file1.txt");
            const expectedObject = { id: "file1", name: "file1.txt", type: "file" };

            server.use(
                http.get(createApiUrl(API_ENDPOINTS.folderItems), async ({ params }) => {
                    return HttpResponse.json({ entries: [expectedObject] });
                })
            );

            const object = await client.findObject(fileOrDirPath);
            assert.deepStrictEqual(object, expectedObject);
        });

        it("should find the object when it exists in a folder", async () => {

            // requires two mocked calls for folder items
            const fileOrDirPath = Path.from("/folder1/file1.txt");
            const expectedObject = { id: "file1", name: "file1.txt", type: "file" };

            server.use(
                http.get(createApiUrl(API_ENDPOINTS.folderItems), async ({ params }) => {

                    if (params.folder_id === "0") {
                        return HttpResponse.json({ entries: [{ id: "folder1", name: "folder1", type: "folder" }] });
                    }

                    return HttpResponse.json({ entries: [expectedObject] });
                })
            );

            const object = await client.findObject(fileOrDirPath);
            assert.deepStrictEqual(object, expectedObject);

        });

        it("should return undefined if a file cannot be found", async () => {
            const fileOrDirPath = Path.from("/file1.txt");

            server.use(
                http.get(createApiUrl(API_ENDPOINTS.folderItems), async () => {
                    return HttpResponse.json({ entries: [] });
                })
            );

            const object = await client.findObject(fileOrDirPath);
            assert.strictEqual(object, undefined);
        });

        it("should return undefined when a folder in the path is not found", async () => {
            const fileOrDirPath = Path.from("/folder1/file1.txt");

            server.use(
                http.get(createApiUrl(API_ENDPOINTS.folderItems), async ({ params }) => {

                        return HttpResponse.json({ entries: [] });
                })
            );

            const object = await client.findObject(fileOrDirPath);
            assert.strictEqual(object, undefined);
        });
        
    });

    describe("moveFile()", () => {

        let client;

        before(() => {
            client = new BoxClient({
                token: "123"
            });
        });

        it("should pass the correct Authorization header", async () => {

            const handler = sinon.fake.resolves(HttpResponse.json({ id: "new-file-id", name: "new-file.txt", type: "file" }));

            server.use(
                http.put(createApiUrl(API_ENDPOINTS.updateFile), handler)
            );

            await client.moveFile("file1", "folder2");

            assert.strictEqual(handler.calledOnce, true);

            const headers = handler.firstCall.args[0].request.headers;
            assert.strictEqual(headers.get("Authorization"), "Bearer 123");

        });

        it("should pass the file ID and new parent ID as parameters", async () => {

            const handler = sinon.fake.resolves(HttpResponse.json({ id: "new-file-id", name: "new-file.txt", type: "file" }));

            server.use(
                http.put(createApiUrl(API_ENDPOINTS.updateFile), handler)
            );

            await client.moveFile("file1", "folder2");

            assert.strictEqual(handler.calledOnce, true);
            const params = handler.firstCall.args[0].params;
            assert.strictEqual(params.file_id, "file1");
            const body = await handler.firstCall.args[0].request.json();
            assert.strictEqual(body.parent.id, "folder2");
        });

        it("should return the result from the API", async () => {

            server.use(
                http.put(createApiUrl(API_ENDPOINTS.updateFile), async () => {
                    return HttpResponse.json({ id: "new-file-id", name: "new-file.txt", type: "file" });
                })
            );

            const object = await client.moveFile("file1", "folder2");
            assert.deepStrictEqual(object, { id: "new-file-id", name: "new-file.txt", type: "file" });
        });

        it("should reject a promise when the server returns a non-OK response", async () => {

            server.use(
                http.put(createApiUrl(API_ENDPOINTS.updateFile), async () => {
                    return new HttpResponse("Unauthorized", {
                        status: 401
                    });
                })
            );

            await assert.rejects(() => client.moveFile("file1", "folder2"), /401/);
        });

    });

    describe("moveFolder()", () => {

        let client;

        before(() => {
            client = new BoxClient({
                token: "123"
            });
        });

        it("should pass the correct Authorization header", async () => {

            const handler = sinon.fake.resolves(HttpResponse.json({ id: "new-folder-id", name: "new-folder", type: "folder" }));

            server.use(
                http.put(createApiUrl(API_ENDPOINTS.updateFolder), handler)
            );

            await client.moveFolder("folder1", "folder2");

            assert.strictEqual(handler.calledOnce, true);

            const headers = handler.firstCall.args[0].request.headers;
            assert.strictEqual(headers.get("Authorization"), "Bearer 123");
        });

        it("should pass the folder ID and new parent ID as parameters", async () => {

            const handler = sinon.fake.resolves(HttpResponse.json({ id: "new-folder-id", name: "new-folder", type: "folder" }));

            server.use(
                http.put(createApiUrl(API_ENDPOINTS.updateFolder), handler)
            );

            await client.moveFolder("folder1", "folder2");

            assert.strictEqual(handler.calledOnce, true);
            const params = handler.firstCall.args[0].params;
            assert.strictEqual(params.folder_id, "folder1");
            const body = await handler.firstCall.args[0].request.json();
            assert.strictEqual(body.parent.id, "folder2");
        });

        it("should return the result from the API", async () => {

            server.use(
                http.put(createApiUrl(API_ENDPOINTS.updateFolder), async () => {
                    return HttpResponse.json({ id: "new-folder-id", name: "new-folder", type: "folder" });
                })
            );

            const object = await client.moveFolder("folder1", "folder2");
            assert.deepStrictEqual(object, { id: "new-folder-id", name: "new-folder", type: "folder" });
        });

        it("should reject a promise when the server returns a non-OK response", async () => {

            server.use(
                http.put(createApiUrl(API_ENDPOINTS.updateFolder), async () => {
                    return new HttpResponse("Unauthorized", {
                        status: 401
                    });
                })
            );

            await assert.rejects(() => client.moveFolder("folder1", "folder2"), /401/);
        });

    });

    describe("uploadFile()", () => {

        let client;
        const UPLOAD_URL = "https://upload.box.com/2.0/files/content";

        before(() => {
            client = new BoxClient({ token: "123" });
        });

        it("should pass the correct Authorization and content-type headers", async () => {

            const optionsHandler = sinon.fake.resolves(HttpResponse.json({ upload_url: UPLOAD_URL }));
            const postHandler = sinon.fake.resolves(HttpResponse.json({ id: "new-file-id", name: "new-file.txt", type: "file" }));

            server.use(
                http.options(createApiUrl(API_ENDPOINTS.upload), optionsHandler),
                http.post(UPLOAD_URL, postHandler)
            );

            await client.uploadFile("new-file.txt", "folder1", "Hello, World!");

            assert.strictEqual(optionsHandler.calledOnce, true);

            const headers = optionsHandler.firstCall.args[0].request.headers;
            assert.strictEqual(headers.get("Authorization"), "Bearer 123");
            assert.strictEqual(headers.get("Content-Type"), "application/json");

            assert.strictEqual(postHandler.calledOnce, true);

            const postHeaders = postHandler.firstCall.args[0].request.headers;
            assert.strictEqual(postHeaders.get("Authorization"), "Bearer 123");
            assert.match(postHeaders.get("Content-Type"), /^multipart\/form-data/);
        });

        it("should pass the folder ID and file name as parameters", async () => {

            const parentId = "folder1";
            const fileName = "new-file.txt";

            // use sinon fakes just like with moveFolder
            const optionsHandler = sinon.fake.resolves(HttpResponse.json({ upload_url: UPLOAD_URL }));
            const postHandler = sinon.fake.resolves(HttpResponse.json({ id: "new-file-id", name: fileName, type: "file" }));

            server.use(
                http.options(createApiUrl(API_ENDPOINTS.upload), optionsHandler),
                http.post(UPLOAD_URL, postHandler)
            );

            await client.uploadFile(fileName, parentId, "Hello, World!");

            assert.strictEqual(optionsHandler.calledOnce, true);
            const body = await optionsHandler.firstCall.args[0].request.json();
            assert.deepStrictEqual(body, { name: fileName, parent: { id: parentId } });
            assert.strictEqual(postHandler.calledOnce, true);
        });
            
        it("should upload a file with the given name and contents", async () => {

            const parentId = "folder1";
            const fileName = "new-file.txt";
            const fileContents = "Hello, World!";
            const expectedObject = { id: "new-file-id", name: fileName, type: "file" };

            // use sinon fakes like with moveFolder

            const optionsHandler = sinon.fake.resolves(HttpResponse.json({ upload_url: UPLOAD_URL }));
            const postHandler = sinon.fake.resolves(HttpResponse.json(expectedObject));

            server.use(
                http.options(createApiUrl(API_ENDPOINTS.upload), optionsHandler),
                http.post(UPLOAD_URL, postHandler)
            );

            const object = await client.uploadFile(fileName, parentId, fileContents);

            assert.deepStrictEqual(object, expectedObject);
            const formData = await postHandler.firstCall.args[0].request.formData();
            const file = formData.get("file");
            assert.strictEqual(file.name, fileName);
            assert.strictEqual(await file.text(), fileContents);
            assert.strictEqual(formData.get("attributes"), JSON.stringify({ name: fileName, parent: { id: parentId } }));
        });

        it("should create a new version of an existing file", async () => {

            const fileId = "file1";
            const fileContents = "Hello, World!";
            const expectedObject = { id: fileId, name: "file1.txt", type: "file" };

            // use sinon fakes like with moveFolder

            const optionsHandler1 = sinon.fake.resolves(
                new HttpResponse(JSON.stringify({
                    code: "item_name_in_use",
                    context_info: {
                        conflicts: {
                            type: "file",
                            id: fileId
                        }
                    }
                }), {
                    status: 409,
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
            );
            const optionsHandler2 = sinon.fake.resolves(HttpResponse.json({ upload_url: UPLOAD_URL }));
            const postHandler = sinon.fake.resolves(HttpResponse.json(expectedObject));

            server.use(
                http.options(createApiUrl(API_ENDPOINTS.upload), optionsHandler1),
                http.options(createApiUrl(API_ENDPOINTS.file), optionsHandler2),
                http.post(UPLOAD_URL, postHandler)
            );

            const object = await client.uploadFile("file1.txt", "0", fileContents);
            assert.deepStrictEqual(object, expectedObject);

            // check the options handlers were called
            assert.strictEqual(optionsHandler1.calledOnce, true);
            assert.strictEqual(optionsHandler2.calledOnce, true);

            // check the params in the second options handler
            const params = optionsHandler2.firstCall.args[0].params;
            assert.strictEqual(params.file_id, fileId);

            // check the post handler
            assert.strictEqual(postHandler.calledOnce, true);

            const formData = await postHandler.firstCall.args[0].request.formData();
            const file = formData.get("file");
            assert.strictEqual(file.name, "file1.txt");
            assert.strictEqual(await file.text(), fileContents);

            const attributes = JSON.parse(await formData.get("attributes"));
            assert.deepStrictEqual(attributes, { name: "file1.txt", parent: { id: "0" } });
        });

        it("should reject an error when the server returns a non-OK response from the preflight call", async () => {

            server.use(
                http.options(createApiUrl(API_ENDPOINTS.upload), async () => {
                    return new HttpResponse("{}", {
                        status: 401
                    });
                })
            );

            await assert.rejects(() => client.uploadFile("file1.txt", "0", "Hello, World!"), /401/);
        });
        
        it("should reject an error when the server returns a non-OK response from the upload call", () => {

            server.use(
                http.options(createApiUrl(API_ENDPOINTS.upload), async () => {
                    return HttpResponse.json({
                        "upload_url": UPLOAD_URL,
                    });
                }),

                http.post(UPLOAD_URL, async () => {
                    return new HttpResponse("Unauthorized", {
                        status: 401
                    });
                })
            );

            return assert.rejects(() => client.uploadFile("file1.txt", "0", "Hello, World!"), /401/);
        });

    });

});
