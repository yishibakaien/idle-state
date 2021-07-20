import path from 'path'
import { uglify } from 'rollup-plugin-uglify'
import serve from 'rollup-plugin-serve'
import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import sourceMaps from 'rollup-plugin-sourcemaps'

const isProduction = process.env.NODE_ENV === 'production'

const config = {
  input: path.resolve(__dirname, 'src/index.js'),
  output: {
    format: 'umd',
    sourcemap: true,
    file: path.resolve(__dirname, `dist/index.${isProduction ? 'min.' : ''}js`),
    name: 'idle',
  },
  plugins: [
    resolve(),
    commonjs(),
    sourceMaps(),
    babel({
      exclude: 'node_modules/**',
    }),
  ],
}

config.plugins.push(
  isProduction
    ? uglify()
    : serve({
        open: true,
        port: 8000,
        openPage: '/public/index.html',
        contentBase: '',
      })
)

export default config
