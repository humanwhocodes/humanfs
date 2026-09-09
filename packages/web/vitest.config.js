/**
 * @fileoverview Vitest configuration for browser tests.
 * @author Nicholas C. Zakas
 */

import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";

export default defineConfig({
	test: {
		// the tester harness reads `describe`/`it` off of `globalThis`
		globals: true,
		include: ["tests/**/*.test.js"],
		browser: {
			enabled: true,
			headless: true,
			provider: playwright(),
			instances: [{ browser: "chromium" }, { browser: "firefox" }],
		},
	},
});
