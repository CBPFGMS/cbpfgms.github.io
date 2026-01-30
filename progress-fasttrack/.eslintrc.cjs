module.exports = {
	root: true,
	env: { browser: true, es2020: true },
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:react-hooks/recommended",
	],
	ignorePatterns: ["dist", ".eslintrc.cjs"],
	parser: "@typescript-eslint/parser",
	plugins: ["@typescript-eslint", "react-refresh"],
	rules: {
		"react-refresh/only-export-components": [
			"warn",
			{ allowConstantExport: true },
		],
		"no-mixed-spaces-and-tabs": "off",
		"no-unused-vars": "off", // Disable the base rule
		"@typescript-eslint/no-unused-vars": [
			"error",
			{
				vars: "all",
				args: "all",
				argsIgnorePattern: "^_",
			},
		],
	},
};
