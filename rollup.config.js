import path from 'path'
import babel from 'rollup-plugin-babel'

export default {
  input: path.resolve(__dirname, 'src/index.js'),
  output: {
    format: 'umd',
    file: path.resolve(__dirname, 'dist/index.js'),
    name: 'idle',
  },
  plugins: [
    babel({
      exclude: 'node_modules/**',
    }),
  ],
}
