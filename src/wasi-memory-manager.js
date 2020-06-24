// A class to manage the wasm memory
export default class WasiMemoryManager {
  constructor (memory, malloc, free) {
    this.memory = memory
    this.malloc = malloc
    this.free = free
  }

  // Convert a pointer from the wasm module to JavaScript string.
  convertToString (ptr, length) {
    try {
      // The pointer is a multi byte character array encoded with utf-8.
      const array = new Uint8Array(this.memory.buffer, ptr, length)
      const decoder = new TextDecoder()
      const string = decoder.decode(array)
      return string
    } finally {
      // Free the memory
      this.free(ptr)
    }
  }

  // Convert a JavaScript string to a pointer to multi byte character array
  convertFromString(string) {
    // Encode the string in utf-8.
    const encoder = new TextEncoder()
    const bytes = encoder.encode(string)
    // Copy the string into memory allocated in the WebAssembly
    const ptr = this.malloc(bytes.byteLength)
    const buffer = new Uint8Array(this.memory.buffer, ptr, bytes.byteLength + 1)
    buffer.set(bytes)
    return buffer
  }

  createTypedArray (typedArrayType, length) {
    const ptr = this.malloc(length * typedArrayType.BYTES_PER_ELEMENT)
    const typedArray = new typedArrayType(
      this.memory.buffer,
      ptr,
      length)
    
      if (typedArray.byteOffset === 0) {
      throw new RangeError('Unable to allocate memory for typed array')
    }

    return typedArray
  }

  invokeUnaryFunction(func, array, typedArrayType) {
    let input = null
    let output = null

    try {
      input = this.createTypedArray(typedArrayType, array.length)
      input.set(array)

      output = new typedArrayType(
        this.memory.buffer,
        func(input.byteOffset, array.length),
        array.length
      )

      if (output.byteOffset === 0) {
        throw new RangeError('Failed to allocate memory')
      }

      const result = Array.from(output)

      return result
    } finally {
      this.free(input.byteOffset)
      this.free(output.byteOffset)
    }
  }

  invokeBinaryFunction(func, lhs, rhs, typedArrayType) {
    if (lhs.length !== rhs.length) {
      throw new RangeError('Arrays must the the same length')
    }
    const length = lhs.length

    let input1 = null
    let input2 = null
    let output = null

    try {
      input1 = this.createTypedArray(typedArrayType, length)
      input2 = this.createTypedArray(typedArrayType, length)

      input1.set(lhs)
      input2.set(rhs)

      output = new typedArrayType(
        this.memory.buffer,
        func(input1.byteOffset, input2.byteOffset, length),
        length
      )

      if (output.byteOffset === 0) {
        throw new RangeError('Failed to allocate memory')
      }

      const result = Array.from(output)

      return result
    } finally {
      this.free(input1.byteOffset)
      this.free(input2.byteOffset)
      this.free(output.byteOffset)
    }
  }

  invokeAggregateFunction(func, array, typedArrayType) {
    let input = null

    try {
      input = this.createTypedArray(typedArrayType, array.length)
      input.set(array)

      return func(input.byteOffset, array.length)
    } finally {
      this.free(input.byteOffset)
    }
  }

}
