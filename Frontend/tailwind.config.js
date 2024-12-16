/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')
const withMT = require("@material-tailwind/react/utils/withMT");

const fontFamily = JSON.parse(JSON.stringify(defaultTheme.fontFamily));

fontFamily.sans = [
  "Inter",
  ...fontFamily.sans
]

module.exports = withMT({
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: fontFamily,
    extend: {
      animation: {
        fadeIn: 'fadeInAnimation 1s ease-in-out',
      },
      keyframes: {
        fadeInAnimation: {
          '0%': {
            opacity: 0
          },
          '100%': {
            opacity: 1
          }
        }
      },
      fontFamily: {
        'poppins': ['poppins', 'inter'],
        'roboto-mono': ['Roboto Mono', 'inter'],
      },
      fontSize: {
        "xxs": [
          '8px', {
            lineHeight: '10px',
            fontWeight: '400'
          }
        ]
      },
      spacing: {
        "66": "260px",
        "63": "248px",
        "25": "100px",
        "13": "52px",
      },
      transitionProperty: {
        'width': 'width'
      },
    },
  },
  variants: {
    extend: {
      display: ['dark']
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
});