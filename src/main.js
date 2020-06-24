import fs from 'fs'

import { Series } from './Series'
import arrayMethods from './array-methods'
import { DataFrame } from './DataFrame'
import setupWasi from './setup-wasi'

function example () {
  'operator-overloading enabled'

  const s1 = new Series('s1', [1, 2, 3, 4], 'int')
  const s2 = new Series('s2', [5, 6, 7, 8], 'int')
  const s3 = s1 + s2
  console.log(s3.toString())

  const slog = s2.log()
  console.log(slog.toString())

  const height = new Series('height', [1.82, 1.72, 1.64, 1.88], 'double')
  console.log(height.toString())

  // Calculate the mean from GSL
  const avg = height.mean()
  console.log('mean', avg)

  const minusHeight = -height
  console.log(minusHeight.toString())

  arrayMethods.set(Symbol.for('**'), (lhs, rhs) => [lhs.array.map((value, index) => value ** rhs), 'object'])
  const sqrHeight = height ** 2
  console.log(sqrHeight.toString())

  arrayMethods.set('max', (lhs) => [[Math.max(...height)], lhs.type])
  const maxHeight = height.max()
  console.log(maxHeight.toString())

  const weight = new Series('weight', [81.4, 72.3, 69.9, 79.5])
  const ratio = weight / height
  console.log(ratio.toString())

  const s4 = new Series('numbers', [1, 2, 3, 4], 'int')
  s4.push(5)
  console.log(s4.toString())

  const df = DataFrame.fromObject(
    [
      { col0: 'a', col1: 5, col2: 8.1 },
      { col0: 'b', col1: 6, col2: 3.2 }
    ],
    { col0: 'object', col1: 'int', col2: 'double'}
  )
  console.log(df.toString())
  df['col3'] = df['col1'] + df['col2']
  console.log(df.toString())
}

async function main () {
  await setupWasi('src-wasm/data-frame.wasm')

  example()
}

main().then(() => console.log('Done')).catch(error => console.error(error))
