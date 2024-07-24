/**
 * @fileoverview The main file for the box package.
 * @author Nicholas C. Zakas
 */
/* global fetch, FormData, Blob, URL */

//-----------------------------------------------------------------------------
// Types
//-----------------------------------------------------------------------------

/** @typedef {import("@humanfs/types").HfsImpl} HfsImpl */
/** @typedef {import("@humanfs/types").HfsDirectoryEntry} HfsDirectoryEntry */
/** @typedef {import("@humanfs/core").Path} Path */

//-----------------------------------------------------------------------------
// Data
//-----------------------------------------------------------------------------

export const API_BASE = "https://api.box.com/2.0/";

export const API_ENDPOINTS = {
	folders: "folders",
	folderItems: "folders/:folder_id/items",
	search: "search",
	file: "files/:file_id/content",
	copyFile: "files/:file_id/copy",
	updateFile: "files/:file_id",
	upload: "files/content",
	updateFolder: "folders/:folder_id",
	copyFolder: "folders/:folder_id/copy",
};

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/**
 * Replaces the parameters in the given URL with the corresponding values from the params object.
 * @param {string} url The URL string with placeholders for parameters.
 * @param {Object} params An object containing key-value pairs of parameters and their values.
 * @returns {string} The updated URL string with replaced parameters.
 */
function replaceParams(url, params) {
	return url.replace(/:(\w+)/g, (match, key) => {
		return params[key];
	});
}

//-----------------------------------------------------------------------------
// Exports
//-----------------------------------------------------------------------------

/**
 * A class representing the Box API client.
 */
export class BoxClient {
	/**
	 * The base URL for the Box API.
	 * @type {string}
	 */
	#apiBase;

	/**
	 * The access token to use for requests.
	 * @type {string}
	 */
	#token;

	/**
	 * The ID of the root folder.
	 * @type {string}
	 */
	#rootFolderId;

	/**
	 * Creates a new instance.
	 * @param {object} options The options for the instance.
	 * @param {string} options.token The access token to use for requests.
	 * @param {string} [options.apiBase] The base URL for the Box API.
	 * @param {string} [options.rootFolderId] The ID of the root folder.
	 * @throws {TypeError} If the token is not a string.
	 * @throws {TypeError} If the URL base is not a string.
	 */
	constructor({ token, apiBase = API_BASE, rootFolderId = "0" }) {
		if (!token) {
			throw new Error("Token must be provided.");
		}

		if (typeof token !== "string") {
			throw new TypeError("Token must be a string.");
		}

		if (apiBase && typeof apiBase !== "string") {
			throw new TypeError("URL base must be a string.");
		}

		if (rootFolderId && typeof rootFolderId !== "string") {
			throw new TypeError("Root folder ID must be a string.");
		}

		this.#token = token;
		this.#rootFolderId = rootFolderId;
		this.#apiBase = apiBase;
	}

	/**
	 * Fetches data from the specified URL using the provided options.
	 * @param {string|URL} url The URL to fetch data from.
	 * @param {object} options The options for the fetch request.
	 * @returns {Promise<Response>} A promise that resolves to the response from the fetch request.
	 */
	#fetch(url, options) {
		const { headers, ...otherOptions } = options;

		return fetch(url, {
			headers: {
				...headers,
				Authorization: `Bearer ${this.#token}`,
			},
			...otherOptions,
		});
	}

	/**
	 * Fetches a collection of items from the server.
	 * @param {URL} url The URL to fetch from.
	 * @param {object} [options] Additional options for the request.
	 * @param {number} [options.limit=100] The number of items to fetch.
	 * @param {string} [options.marker] The marker to use for fetching additional
	 * items.
	 * @returns {Promise<Object>} A promise that resolves with the JSON response from the
	 *  server.
	 */
	#fetchCollection(url, { limit = 100, marker = null } = {}) {
		url.searchParams.set("limit", limit.toString());
		url.searchParams.set("usemarker", "true");

		if (marker) {
			url.searchParams.set("marker", marker);
		}

		return fetch(url, {
			headers: {
				Authorization: `Bearer ${this.#token}`,
			},
		}).then(response => {
			if (!response.ok) {
				throw new Error(response.statusText);
			}
			return response.json();
		});
	}

	/**
	 * Copies a file to the given parent folder.
	 * @param {string} fileId The ID of the file to copy.
	 * @param {string} parentId The ID of the parent folder.
	 * @param {object} [options] Additional options for the request.
	 * @param {string} [options.name] The name to use for the copied file.
	 * @returns {Promise<Object>} A promise that resolves to the JSON response from the server.
	 * @throws {Error} If the server returns a non-OK response.
	 */
	async copyFile(fileId, parentId, { name } = {}) {
		const url = new URL(
			replaceParams(API_ENDPOINTS.copyFile, { file_id: fileId }),
			this.#apiBase,
		);
		const response = await this.#fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				name,
				parent: {
					id: parentId,
				},
			}),
		});

		if (!response.ok) {
			throw new Error(`${response.status} ${response.statusText}`);
		}

		return response.json();
	}

	/**
	 * Copies a folder to the given parent folder.
	 * @param {string} folderId The ID of the folder to copy.
	 * @param {string} parentId The ID of the parent folder.
	 * @param {object} [options] Additional options for the request.
	 * @param {string} [options.name] The name to use for the copied folder.
	 * @returns {Promise<Object>} A promise that resolves to the JSON response from the server.
	 * @throws {Error} If the server returns a non-OK response.
	 * @throws {TypeError} If the folder ID or parent ID are not strings.
	 */
	async copyFolder(folderId, parentId, { name } = {}) {
		const url = new URL(
			replaceParams(API_ENDPOINTS.copyFolder, { folder_id: folderId }),
			this.#apiBase,
		);
		const response = await this.#fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				name,
				parent: {
					id: parentId,
				},
			}),
		});

		if (!response.ok) {
			throw new Error(`${response.status} ${response.statusText}`);
		}

		return response.json();
	}

	/**
	 * Creates a new folder with the given name and parent ID.
	 * @param {string} name The name of the folder.
	 * @param {string} parentId The ID of the parent folder.
	 * @returns {Promise<Object>} A promise that resolves to the JSON response from the server.
	 * @throws {Error} If the server returns a non-OK response.
	 */
	async createFolder(name, parentId) {
		const url = new URL("folders", this.#apiBase);
		const response = await fetch(url, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${this.#token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				name,
				parent: {
					id: parentId,
				},
			}),
		});

		if (!response.ok) {
			throw new Error(`${response.status} ${response.statusText}`);
		}

		return response.json();
	}

	/**
	 * Deletes a file from the server.
	 * @param {string} fileId The ID of the file to delete.
	 * @returns {Promise<Object>} A promise that resolves to the JSON response from the server.
	 * @throws {Error} If the server returns a non-OK response status.
	 */
	async deleteFile(fileId) {
		const url = new URL(
			replaceParams(API_ENDPOINTS.updateFile, { file_id: fileId }),
			this.#apiBase,
		);
		const response = await this.#fetch(url, {
			method: "DELETE",
		});

		if (!response.ok) {
			throw new Error(`${response.status} ${response.statusText}`);
		}
	}

	/**
	 * Deletes a folder from the server.
	 * @param {string} folderId The ID of the folder to delete.
	 * @returns {Promise<Object>} A promise that resolves to the JSON response from the server.
	 * @throws {Error} If the server returns a non-OK response status.
	 */
	async deleteFolder(folderId) {
		const url = new URL(
			replaceParams(API_ENDPOINTS.updateFolder, { folder_id: folderId }),
			this.#apiBase,
		);
		const response = await this.#fetch(url, {
			method: "DELETE",
		});

		if (!response.ok) {
			throw new Error(`${response.status} ${response.statusText}`);
		}
	}

	/**
	 * Downloads a file from the server.
	 * @param {string} fileId The ID of the file to download.
	 * @returns {Promise<Response>} A promise that resolves to the response object representing the downloaded file.
	 * @throws {Error} If the server returns a non-OK response status.
	 */
	async download(fileId) {
		const url = new URL(
			replaceParams(API_ENDPOINTS.file, { file_id: fileId }),
			this.#apiBase,
		);
		const response = await fetch(url, {
			headers: {
				Authorization: `Bearer ${this.#token}`,
			},
		});

		if (!response.ok) {
			throw new Error(`${response.status} ${response.statusText}`);
		}

		return response;
	}

	/**
	 * Fetches the contents of a folder.
	 * @param {string} folderId The ID of the folder to fetch.
	 * @param {object} [options] Additional options for the request.
	 * @param {number} [options.limit=100] The number of items to fetch.
	 * @param {string} [options.marker] The marker to use for fetching additional
	 *  items.
	 * @returns {Promise<Object>} A promise that resolves with the response from the
	 *   server.
	 */
	fetchFolderItems(folderId, { limit = 100, marker = null } = {}) {
		const url = new URL(
			replaceParams(API_ENDPOINTS.folderItems, { folder_id: folderId }),
			this.#apiBase,
		);
		url.searchParams.set("fields", "name,type,id,modified_at,size");

		return this.#fetchCollection(url, { limit, marker });
	}

	/**
	 * Walks the given path using the Box API to find the given object.
	 * @param {Path} fileOrDirPath The path to the object to find.
	 * @returns {Promise<Object|undefined>} A promise that resolves with the
	 * object entry.
	 */
	async findObject(fileOrDirPath) {
		let folderId = this.#rootFolderId;
		let object;

		for (const entryName of fileOrDirPath) {
			const { entries } = await this.fetchFolderItems(folderId);
			const entry = entries.find(entry => entry.name === entryName);

			// TODO: Should we retry if the entry isn't found?

			if (!entry) {
				return undefined;
			}

			object = entry;
			folderId = entry.id;
		}

		return object;
	}

	/**
	 * Ensures that a folder exists at the given path. If the folder doesn't exist,
	 * or any of its ancestors don't exist, they are created.
	 * @param {Path} dirPath The path to the folder to create.
	 * @returns {Promise<Object>} A promise that resolves with the folder entry.
	 */
	async ensurePathExists(dirPath) {
		let folderId = this.#rootFolderId;
		let folder;

		for (const entryName of dirPath) {
			const { entries } = await this.fetchFolderItems(folderId);
			const entry = entries.find(entry => entry.name === entryName);

			if (entry) {
				folderId = entry.id;
				folder = entry;
			} else {
				folder = await this.createFolder(entryName, folderId);
				folderId = folder.id;
			}
		}

		return folder;
	}

	/**
	 * Moves a file to the given parent folder.
	 * @param {string} fileId The ID of the file to move.
	 * @param {string} parentId The ID of the parent folder.
	 * @param {object} [options] Additional options for the request.
	 * @param {string} [options.name] The name to use for the moved file.
	 * @returns {Promise<Object>} A promise that resolves to the JSON response from the server.
	 * @throws {Error} If the server returns a non-OK response.
	 * @throws {TypeError} If the file ID or parent ID are not strings.
	 * @throws {PermissionError} If the operation is not permitted.
	 * @throws {NotFoundError} If the file is not found.
	 */
	async moveFile(fileId, parentId, { name } = {}) {
		const url = new URL(
			replaceParams(API_ENDPOINTS.updateFile, { file_id: fileId }),
			this.#apiBase,
		);
		const response = await this.#fetch(url, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				name,
				parent: {
					id: parentId,
				},
			}),
		});

		if (!response.ok) {
			throw new Error(`${response.status} ${response.statusText}`);
		}

		return response.json();
	}

	/**
	 * Moves a folder to the given parent folder.
	 * @param {string} folderId The ID of the folder to move.
	 * @param {string} parentId The ID of the parent folder.
	 * @param {object} [options] Additional options for the request.
	 * @param {string} [options.name] The name to use for the moved folder.
	 * @returns {Promise<Object>} A promise that resolves to the JSON response from the server.
	 * @throws {Error} If the server returns a non-OK response.
	 * @throws {TypeError} If the folder ID or parent ID are not strings.
	 * @throws {PermissionError} If the operation is not permitted.
	 * @throws {NotFoundError} If the folder is not found.
	 */
	async moveFolder(folderId, parentId, { name } = {}) {
		const url = new URL(
			replaceParams(API_ENDPOINTS.updateFolder, { folder_id: folderId }),
			this.#apiBase,
		);
		const response = await this.#fetch(url, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				name,
				parent: {
					id: parentId,
				},
			}),
		});

		if (!response.ok) {
			throw new Error(`${response.status} ${response.statusText}`);
		}

		return response.json();
	}

	/**
	 * Uploads a file to the given parent folder. If the file already exists, a new
	 * version is created. If the file is a different type (e.g. a folder or weblink),
	 * an error is thrown.
	 * @param {string} name The name of the file to upload.
	 * @param {string} parentId The ID of the parent folder.
	 * @param {string|Uint8Array} contents The contents of the file to upload.
	 * @returns
	 */
	async uploadFile(name, parentId, contents) {
		// first do the preflight check
		const preflightUrl = new URL(API_ENDPOINTS.upload, this.#apiBase);
		const preflightOptions = {
			method: "OPTIONS",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				name,
				parent: {
					id: parentId,
				},
			}),
		};

		let preflightResponse = await this.#fetch(
			preflightUrl,
			preflightOptions,
		);
		let preflight = await preflightResponse.json();
		if (!preflightResponse.ok) {
			if (preflight.code === "item_name_in_use") {
				// if it's a folder or weblink, throw an error
				if (preflight.context_info.conflicts.type !== "file") {
					throw new Error(`EEXIST: File exists: ${name}`);
				}

				const fileId = preflight.context_info.conflicts.id;

				// if it's a file, then update the file
				preflightResponse = await this.#fetch(
					new URL(
						replaceParams(API_ENDPOINTS.file, { file_id: fileId }),
						this.#apiBase,
					),
					preflightOptions,
				);

				if (!preflightResponse.ok) {
					throw new Error(
						`${preflightResponse.status} ${preflightResponse.statusText}`,
					);
				}

				preflight = await preflightResponse.json();
			} else {
				throw new Error(
					`${preflightResponse.status} ${preflightResponse.statusText}`,
				);
			}
		}

		// then do the file upload
		const form = new FormData();
		form.append(
			"attributes",
			JSON.stringify({
				name,
				parent: {
					id: parentId,
				},
			}),
		);
		form.append("file", new Blob([contents]), name);

		const response = await this.#fetch(preflight.upload_url, {
			method: "POST",
			body: form,
		});

		if (!response.ok) {
			throw new Error(`${response.status} ${response.statusText}`);
		}

		return await response.json();
	}
}
