import path from 'path'
import { terser } from 'rollup-plugin-terser'
import serve from 'rollup-plugin-serve'
import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import sourceMaps from 'rollup-plugin-sourcemaps'
import typescript from 'rollup-plugin-typescript2'

const isProduction = process.env.NODE_ENV === 'production'

const config = {
  input: path.resolve(__dirname, 'src/index.ts'),
  output: {
    format: 'umd',
    sourcemap: true,
    file: path.resolve(
      __dirname,
      `dist/idle-state.${isProduction ? 'min.' : ''}js`
    ),
    name: 'idle',
  },
  plugins: [
    resolve(),
    commonjs(),
    sourceMaps(),
    typescript({
      typescript: require('typescript'),
      cacheRoot: `.cache/typescript`,
    }),
    babel({
      exclude: 'node_modules/**',
    }),
  ],
}

config.plugins.push(
  isProduction
    ? terser({
        compress: { passes: 10 },
        ecma: 5,
        warnings: true,
      })
    : serve({
        open: true,
        port: 8000,
        openPage: '/public/index.html',
        contentBase: '',
      })
)

export default config
