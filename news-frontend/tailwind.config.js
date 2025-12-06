/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Merriweather', 'serif'], // Custom serif font
        body: ['Merriweather', 'serif'],  // Optional alias
      },
    },
  },
  plugins: [],
};


  

