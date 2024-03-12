/** @type {import('tailwindcss').Config} */
export default {
	content: [
		'./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
		'./node_modules/@wp-block-tools/styles/**/*.js',
	],
	theme: {
		extend: {
			colors: {
				"starlight": "var(--color--starlight)",
				"blue-light": "var(--color--blue-light)",
				"blue-med": "var(--color--blue-med)",
				"blue-sky": "var(--color--blue-sky)",
				"grey-light": "var(--color--grey-light)",
			},
		},
	},
	plugins: [],
}
