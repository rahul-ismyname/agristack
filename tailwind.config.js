/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                outfit: ['Outfit', 'sans-serif'],
            },
            colors: {
                primary: {
                    DEFAULT: '#00C412',
                    light: '#52B788',
                    dark: '#0F3325',
                    vivid: '#00E515',
                    hover: '#00A810',
                },
                accent: {
                    DEFAULT: '#E8F5E9',
                    dark: '#C8E6C9',
                },
                surface: {
                    DEFAULT: '#FFFFFF',
                    dim: '#F5F7F5',
                },
            },
        },
    },
    plugins: [],
}
