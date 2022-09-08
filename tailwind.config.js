module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
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
      "bots-gray": "#454546",
      "bots-red": "#EE3C32",
      "bots-yellow": "#F6DE37",
      "bots-orange": "#F17E34",
    },
  },
  plugins: [],
};
