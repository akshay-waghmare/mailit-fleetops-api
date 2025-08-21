/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./apps/*/src/**/*.{html,ts}",
    "./libs/*/src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // FleetOps Brand Colors
        fleet: {
          primary: '#3182ce',
          secondary: '#2c3e50',
          accent: '#28a745',
          warning: '#ffc107',
          danger: '#dc3545',
          gray: {
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b',
            600: '#475569',
            700: '#334155',
            800: '#1e293b',
            900: '#0f172a',
          }
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
      boxShadow: {
        'fleet': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'fleet-lg': '0 8px 24px rgba(0, 0, 0, 0.12)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}

