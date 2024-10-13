import eslint from "@eslint/js"
import tseslint from "typescript-eslint"

export default tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.stylisticTypeChecked,
	...tseslint.configs.strictTypeChecked,
	{
		ignores: [
			"packages/*/dist/",
			".yarn/",
			".pnp.*",
			"**/*.js",
			"**/*.mjs"
		]
	},
	{
		languageOptions: {
			parserOptions: {
				projectService: true
			}
		},
	},
)
