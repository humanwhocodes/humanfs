/**
 * @fileoverview A mocked Box API server for testing purposes.
 * @author Nicholas C. Zakas
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { API_BASE, API_ENDPOINTS } from "../../src/box-client.js";
import { ObjectStore } from "@humanwhocodes/object-store";

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

function createApiUrl(endpoint) {
	return API_BASE + endpoint;
}

//-----------------------------------------------------------------------------
// Server
//-----------------------------------------------------------------------------

const ROOT_ID = "0";
const store = new ObjectStore({ rootFolderId: ROOT_ID });
const server = setupServer();

server.use(
	//-------------------------------------------------------------------------
	// Files
	//-------------------------------------------------------------------------

	// upload new file -- write()
	http.post(createApiUrl(API_ENDPOINTS.upload), async ({ request }) => {
		const formData = await request.formData();
		const file = formData.get("file");
		const attributes = JSON.parse(formData.get("attributes"));
		const parentId = attributes.parent.id;
		const name = attributes.name;

		const { id: fileId } = store.createFile(name, {
			parentId,
			content: await file.arrayBuffer(),
		});

		return HttpResponse.json({
			id: fileId,
		});
	}),

	// update existing file -- write()
	http.post(createApiUrl(API_ENDPOINTS.file), async ({ request, params }) => {
		const { file_id: fileId } = params;
		const formData = await request.formData();
		const file = formData.get("file");

		store.updateFile(fileId, { content: await file.arrayBuffer() });
		return HttpResponse.json({
			id: fileId,
		});
	}),

	// preflight check for new file - write()
	http.options(createApiUrl(API_ENDPOINTS.upload), async ({ request }) => {
		const {
			name,
			parent: { id: parentId },
		} = await request.json();

		const parent = store.getFolder(parentId);

		// check if the file already exists
		for await (const entry of parent.entries) {
			if (entry.name === name) {
				return new HttpResponse(
					JSON.stringify({
						code: "item_name_in_use",
						message:
							"An item with the same name already exists in this folder.",
						context_info: {
							conflicts: {
								id: entry.id,
								type: entry.type,
							},
						},
					}),
					{
						status: 409,
					},
				);
			}
		}

		return HttpResponse.json({
			upload_url: createApiUrl(API_ENDPOINTS.upload),
		});
	}),

	// preflight check for existing file - write()
	http.options(
		createApiUrl(API_ENDPOINTS.file),
		async ({ params, request }) => {
			const { file_id: fileId } = params;
			const {
				parent: { id: parentId },
			} = await request.json();
			const parent = store.getFolder(parentId);

			// make sure the file actually exists
			for await (const entry of parent.entries) {
				if (entry.id === fileId) {
					return HttpResponse.json({
						upload_url: createApiUrl(
							API_ENDPOINTS.file.replace(":file_id", fileId),
						),
					});
				}
			}

			return new HttpResponse("Not found", { status: 404 });
		},
	),

	// copy file
	http.post(
		createApiUrl(API_ENDPOINTS.copyFile),
		async ({ request, params }) => {
			const { file_id: fileId } = params;
			const {
				name,
				parent: { id: parentId },
			} = await request.json();

			const newFile = store.copyFile(fileId, { parentId, name });

			return HttpResponse.json({
				id: newFile.id,
			});
		},
	),

	// download file - bytes()
	http.get(createApiUrl(API_ENDPOINTS.file), async ({ params }) => {
		const { file_id: fileId } = params;

		try {
			const contents = store.getFileContent(fileId);
			return HttpResponse.arrayBuffer(contents);
		} catch (ex) {
			if (ex.code === "ENOENT") {
				return new HttpResponse("Not found", { status: 404 });
			}

			throw ex;
		}
	}),

	// move file
	http.put(
		createApiUrl(API_ENDPOINTS.updateFile),
		async ({ request, params }) => {
			const { file_id: fileId } = params;
			const {
				parent: { id: parentId },
				name,
			} = await request.json();

			store.updateFile(fileId, { parentId, name });

			return HttpResponse.json({
				id: fileId,
			});
		},
	),

	// delete file
	http.delete(createApiUrl(API_ENDPOINTS.updateFile), async ({ params }) => {
		const { file_id: fileId } = params;
		store.deleteFile(fileId);
		return new HttpResponse(204);
	}),

	//-------------------------------------------------------------------------
	// Folders
	//-------------------------------------------------------------------------

	// create folder -- createDirectory()
	http.post(createApiUrl(API_ENDPOINTS.folders), async ({ request }) => {
		const {
			name,
			parent: { id: parentId },
		} = await request.json();
		const newFolder = store.createFolder(name, { parentId });
		return HttpResponse.json({
			id: newFolder.id,
		});
	}),

	// copy folder
	http.post(
		createApiUrl(API_ENDPOINTS.copyFolder),
		async ({ request, params }) => {
			const { folder_id: folderId } = params;
			const {
				name,
				parent: { id: parentId },
			} = await request.json();
			const newFolder = store.copyFolder(folderId, { parentId, name });
			return HttpResponse.json({
				id: newFolder.id,
			});
		},
	),

	// move folder
	http.put(
		createApiUrl(API_ENDPOINTS.updateFolder),
		async ({ request, params }) => {
			const { folder_id: folderId } = params;
			const {
				parent: { id: parentId },
				name,
			} = await request.json();
			store.updateFolder(folderId, { parentId, name });
			return HttpResponse.json({
				id: folderId,
			});
		},
	),

	// list folder items -- isFile(), isDirectory()
	http.get(createApiUrl(API_ENDPOINTS.folderItems), async ({ params }) => {
		const { folder_id: folderId } = params;

		try {
			const { entries } = store.getFolder(folderId);

			return HttpResponse.json({
				entries,
			});
		} catch (ex) {
			if (ex.code === "ENOENT") {
				return new HttpResponse("Not found", { status: 404 });
			}

			throw ex;
		}
	}),

	// delete folder - deleteAll()
	http.delete(
		createApiUrl(API_ENDPOINTS.updateFolder),
		async ({ params }) => {
			const { folder_id: folderId } = params;
			store.deleteFolder(folderId);
			return new HttpResponse(204);
		},
	),
);

export { server };
