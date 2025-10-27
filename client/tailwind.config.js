/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                'inter': ['Inter', 'sans-serif'],
                'league': ['League Gothic', 'sans-serif'],
                'sans': ['Inter', 'sans-serif'],
                'montserrat': ['Montserrat', 'sans-serif'],
            },
            boxShadow: {
                'custom': '2px 4px 16px 0 rgba(17, 34, 17, 0.10)',
            },
        },
    },
    plugins: [],
}