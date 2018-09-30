import { uglify } from 'rollup-plugin-uglify'

export default {
  input: './src/canvasResize.js',
  output: {
    file: './dist/canvasResize.min.js',
    format: 'umd',
    name: 'canvasResize'
  },
  plugins: [uglify()]
}