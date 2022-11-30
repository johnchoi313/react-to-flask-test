module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        roboto: "'Roboto', sans-serif",
        montserrat: "'Montserrat', sans-serif",
        robotomono: "'Roboto Mono', monospace",
      },
    },
    colors: {
      'bots-gray': '#454546',
      'bots-light-gray': '#b5b5b5',
      'bots-red': '#EE3C32',
      'bots-yellow': '#F6DE37',
      'bots-orange': '#F17E34',
      'bots-light-orange': '#FF9E54',
      'bots-blue': '#1FB6FF',
      'bots-light-blue': '#6FD6FF',
      'bots-white': '#FFFFFF',
      'bots-subtle': '#F0FAFF',
    },
  },
  plugins: [],
};
