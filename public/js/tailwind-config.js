// TODO: Considerar remover Tailwind CDN e migrar para CSS vanilla
// para reduzir bundle size (~3MB) e seguir a filosofia "Vanilla Stack"

tailwind.config = {
  theme: {
    extend: {
      colors: {
        brand: {
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
        },
        dark: {
          bg: '#0f172a',
          surface: '#1e293b',
        },
        accent: {
          purple: '#8b5cf6',
          pink: '#ec4899',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        display: ['Rajdhani', 'sans-serif'],
      },
    },
  },
};
