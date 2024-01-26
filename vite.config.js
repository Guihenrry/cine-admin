const path = require('path')

export default {
  root: path.resolve(__dirname, 'src'),
  build: {
    outDir: '../dist',
    rollupOptions: {
      input: {
        login: path.resolve(__dirname, 'src', 'index.html'),
        movies: path.resolve(__dirname, 'src', 'movies.html'),
        manager: path.resolve(__dirname, 'src', 'manager.html'),
      },
    },
  },
  server: {
    port: 8080,
  },
}
