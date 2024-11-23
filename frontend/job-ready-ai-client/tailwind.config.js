/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{html,ts}",
    ],
    theme: {
      extend: {
        colors: {
          'chatgpt': {
            'sidebar': '#202123',
            'hover': '#2A2B32',
            'border': '#4E4F60',
            'selected': '#343541',
            'bot': '#444654',
          }
        }
      },
    },
    plugins: [
      require('@tailwindcss/typography'),
    ],
  }