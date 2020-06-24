import fs from 'fs'

import arrayMethods from './array-methods'
import Wasi from './wasi'
import WasiMemoryManager from './wasi-memory-manager'

function chooseBestType(lhsType, rhsType) {
  if (lhsType === 'int' && rhsType == 'int') {
    return 'int'
  } else if (
    (lhsType === 'int' && rhsType === 'double') || 
    (lhsType === 'double' && rhsType === 'int')) {
    return 'double'
  } else {
    return 'object'
  }
}

function makeBinaryOperation(wasiMemoryManager, intFunc, doubleFunc, defaultFunc) {
  return (lhs, rhs) => {
    const bestType = chooseBestType(lhs.type, rhs.type)

    if (bestType === 'int') {
      const result =  wasiMemoryManager.invokeBinaryFunction(
        intFunc,
        lhs.array,
        rhs.array,
        Int32Array
      )
      return [result, bestType]
    } else if (bestType === 'double') {
      const result = wasiMemoryManager.invokeBinaryFunction(
        doubleFunc,
        lhs.array,
        rhs.array,
        Float64Array
      )
      return [result, bestType]
    } else {
      const result = defaultFunc(lhs, rhs)
      return [result, bestType]
    }
  }
}

function makeUnaryOperation(wasiMemoryManager, intFunc, doubleFunc, defaultFunc) {
  return (series) => {

    if (series.type === 'int' && intFunc != null) {
      const result = wasiMemoryManager.invokeUnaryFunction(
        intFunc,
        series.array,
        Int32Array
      )
      return [result, series.type]
    } else if ((series.type === 'double' || series.type === 'int') && doubleFunc != null) {
      const result = wasiMemoryManager.invokeUnaryFunction(
        doubleFunc,
        series.array,
        Float64Array
      )
      return [result, series.type]
    } else {
      const result = defaultFunc(series)
      return [result, series.type]
    }
  }
}

function makeAggregateOperation(wasiMemoryManager, intFunc, doubleFunc, defaultFunc) {
  return (series) => {

    if (series.type === 'int' && intFunc != null) {
      const result = wasiMemoryManager.invokeUnaryFunction(
        intFunc,
        series.array,
        Int32Array
      )
      return [result, series.type]
    } else if ((series.type === 'double' || series.type === 'int') && doubleFunc != null) {
      const result = wasiMemoryManager.invokeAggregateFunction(
        doubleFunc,
        series.array,
        Float64Array
      )
      return [result, series.type]
    } else {
      const result = defaultFunc(series)
      return [result, series.type]
    }
  }
}

export default async function setupWasi(fileName) {
  // Read the wasm file.
  const buf = fs.readFileSync(fileName)

  // Create the Wasi instance passing in some environment variables.
  const wasi = new Wasi({
    "LANG": "en_GB.UTF-8",
    "TERM": "xterm"
  })

  // Instantiate the wasm module.
  const res = await WebAssembly.instantiate(buf, {
    wasi_snapshot_preview1: wasi
  })

  // Initialise the wasi instance
  wasi.init(res.instance)

  const {
    addInt32Arrays,
    subtractInt32Arrays,
    multiplyInt32Arrays,
    divideInt32Arrays,
    negateInt32Array,

    addFloat64Arrays,
    subtractFloat64Arrays,
    multiplyFloat64Arrays,
    divideFloat64Arrays,
    negateFloat64Array,
    logFloat64Array,

    meanFloat64Array
  } = res.instance.exports

  arrayMethods.set(
    Symbol.for('+'),
    makeBinaryOperation(
      wasi.wasiMemoryManager,
      addInt32Arrays,
      addFloat64Arrays,
      (lhs, rhs) => lhs.array.map((value, index) => value + rhs.array[index])
    )
  )

  arrayMethods.set(
    Symbol.for('-'),
    makeBinaryOperation(
      wasi.wasiMemoryManager,
      subtractInt32Arrays,
      subtractFloat64Arrays,
      (lhs, rhs) => lhs.array.map((value, index) => value - rhs.array[index])
    )
  )

  arrayMethods.set(
    Symbol.for('*'),
    makeBinaryOperation(
      wasi.wasiMemoryManager,
      multiplyInt32Arrays,
      multiplyFloat64Arrays,
      (lhs, rhs) => lhs.array.map((value, index) => value * rhs.array[index])
    )
  )

  arrayMethods.set(
    Symbol.for('/'),
    makeBinaryOperation(
      wasi.wasiMemoryManager,
      divideInt32Arrays,
      divideFloat64Arrays,
      (lhs, rhs) => lhs.array.map((value, index) => value / rhs.array[index])
    )
  )

  arrayMethods.set(
    Symbol.for('minus'),
    makeUnaryOperation(
      wasi.wasiMemoryManager,
      negateInt32Array,
      negateFloat64Array,
      (series) => series.array.map(value => -value)
    )
  ) 

  arrayMethods.set(
    'log',
    makeUnaryOperation(
      wasi.wasiMemoryManager,
      null,
      logFloat64Array,
      (series) => series.array.map(value => Math.log(value))
    )
  ) 

  arrayMethods.set(
    'mean',
    makeAggregateOperation(
      wasi.wasiMemoryManager,
      null,
      meanFloat64Array,
      (series) => series.array.reduce((a, b) => a + b, 0) / series.array.length
    )
  ) 

  return wasi
}

module.exports = setupWasi
