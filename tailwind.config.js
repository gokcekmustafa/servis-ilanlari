/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'bg-blue-50', 'bg-blue-100', 'border-blue-200', 'border-blue-300', 'border-blue-400', 'text-blue-600', 'text-blue-700',
    'bg-green-50', 'bg-green-100', 'border-green-200', 'border-green-300', 'border-green-400', 'text-green-600', 'text-green-700',
    'bg-orange-50', 'bg-orange-100', 'border-orange-200', 'border-orange-300', 'border-orange-400', 'text-orange-600', 'text-orange-700',
    'bg-purple-50', 'bg-purple-100', 'border-purple-200', 'border-purple-300', 'border-purple-400', 'text-purple-600', 'text-purple-700',
    'bg-pink-50', 'bg-pink-100', 'border-pink-200', 'border-pink-300', 'border-pink-400', 'text-pink-600', 'text-pink-700',
    'bg-yellow-50', 'bg-yellow-100', 'border-yellow-200', 'border-yellow-300', 'border-yellow-400', 'text-yellow-600', 'text-yellow-700',
    'bg-red-50', 'bg-red-100', 'border-red-200', 'border-red-300', 'border-red-400', 'text-red-600', 'text-red-700',
    'bg-amber-50', 'bg-amber-100', 'border-amber-200', 'text-amber-600', 'text-amber-700',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a3c6e',
        accent: '#f97316',
      },
    },
  },
  plugins: [],
}
