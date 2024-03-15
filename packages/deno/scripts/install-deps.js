/**
 * @fileoverview Installs the dependencies listed in deno.json,
 * rewriting the local files to be npm packages. This is necessary
 * because the deno runtime does not support local file imports
 * when publishing a package.
 *
 * The results of running this script are not committed to the
 * repository, but are instead generated on demand just before
 * JSR publish.
 * @author Nicholas C. Zakas
 */
/* global console */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import fs from "node:fs/promises";
import { exec } from "node:child_process";

//------------------------------------------------------------------------------
// Main
//------------------------------------------------------------------------------

const denoJson = JSON.parse(await fs.readFile("./deno.json", "utf8"));

// run deno add dep for each
const cmd = `deno add ${Object.keys(denoJson.imports)
	.map(dep => `npm:${dep}`)
	.join(" ")}`;

await exec(cmd, (error, stdout, stderr) => {
	if (error) {
		console.error(`error: ${error.message}`);
		return;
	}
	if (stderr) {
		console.error(`stderr: ${stderr}`);
		return;
	}
	console.log(`stdout: ${stdout}`);
});
