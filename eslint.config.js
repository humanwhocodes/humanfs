import js from "@eslint/js";
import globals from "globals";

export default [
	js.configs.recommended,
	{
		rules: {
			"no-unused-vars": ["error", { ignoreRestSiblings: true }],
		},
	},

	// source and tests target the Node.js/web-standard runtime baseline
	{
		files: ["**/*.js"],
		languageOptions: {
			globals: {
				...globals.nodeBuiltin,
			},
		},
	},

	// the web package runs in the browser
	{
		files: ["packages/web/**/*.js"],
		languageOptions: {
			globals: {
				...globals.browser,
			},
		},
	},

	// the Deno package runs in Deno
	{
		files: ["packages/deno/**/*.js"],
		languageOptions: {
			globals: {
				Deno: "readonly",
			},
		},
	},

	// tests use the Mocha (and Vitest-compatible) BDD globals
	{
		files: ["packages/*/tests/**/*.js"],
		languageOptions: {
			globals: {
				...globals.mocha,
			},
		},
	},
];
